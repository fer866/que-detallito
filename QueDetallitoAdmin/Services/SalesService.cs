using QueDetallitoAdmin.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Dapper;
using QueDetallitoAdmin.Entities.Sales;
using QueDetallitoAdmin.Models.Sales;
using QueDetallitoAdmin.Models;
using MimeKit;
using System.IO;
using Microsoft.AspNetCore.Hosting;
using QueDetallitoAdmin.Models.Production;

namespace QueDetallitoAdmin.Services
{
    public interface ISalesService
    {
        Task<IEnumerable<OrderPost>> GetLastestSales();
        Task<IEnumerable<int>> GetSalesYears();
        Task<IEnumerable<OrderPost>> GetSales(OrderParamPost param);
        Task<OrderPost> GetSale(OrderParamPost param);
        Task ChangeOrderStatus(OrderParamPost param);
        Task<IEnumerable<OrderProduct>> GetOrderProducts(OrderParamPost param);
        Task<CustomerDeliveryModel> GetDeliveryOrder(int idDelivery);
        Task<IEnumerable<CatalogModel>> GetNextOrderStatus(int id, int orderYear);
        Task<IEnumerable<CartItems>> GetCartItems();
    }
    public class SalesService : ISalesService
    {
        private enum OrderStatus
        {
            Cancelled = 2,
            Payed = 5,
            InProcess = 6,
            InDelivery = 7,
            Delivered = 8
        }
        private readonly IDatabaseConnection _context;
        private readonly IEmailService _emailService;
        private readonly IWebHostEnvironment _env;
        public SalesService(IDatabaseConnection context, IEmailService emailService, IWebHostEnvironment env)
        {
            _context = context;
            _emailService = emailService;
            _env = env;
        }

        public async Task<IEnumerable<OrderPost>> GetLastestSales()
        {
            using var conn = await _context.CreateConnectionAsync();

            var param = new { year = DateTime.Now.LocalTime().Year };
            var list = await conn.QueryAsync<OrderPost>("select top 10 * from Admon.ViewOrders where orderYear = @year order by created desc", param);

            return list;
        }

        public async Task<IEnumerable<int>> GetSalesYears()
        {
            using var conn = await _context.CreateConnectionAsync();

            List<int> listYears = new List<int>();
            var years = await conn.QueryAsync<int>("select OrderYear from Sales.Orders group by OrderYear");
            if (years == null || !years.Any())
            {
                listYears.Add(DateTime.Now.LocalTime().Year);
            }
            else
            {
                listYears = years.ToList();
            }
            return listYears;
        }

        public async Task<IEnumerable<OrderPost>> GetSales(OrderParamPost param)
        {
            using var conn = await _context.CreateConnectionAsync();

            IEnumerable<OrderPost> list = null;
            if (param.IdStatus != 0)
            {
                list = await conn.QueryAsync<OrderPost>("select * from Admon.ViewOrders " +
                    "where orderYear = @OrderYear and idStatus = @IdStatus order by DeliveryDate asc", param);
            }
            else
            {
                list = await conn.QueryAsync<OrderPost>("select * from Admon.ViewOrders " +
                    "where orderYear = @OrderYear order by DeliveryDate asc, IdStatus asc", param);
            }
            return list;
        }

        public async Task<OrderPost> GetSale(OrderParamPost param)
        {
            using var conn = await _context.CreateConnectionAsync();

            var order = await conn.QuerySingleOrDefaultAsync<OrderPost>("select * from Admon.ViewOrders where id = @ID and orderYear = @OrderYear", param);
            if (order == null)
                throw new AppException("La orden que solicitó no existe, favor de verificar");

            return order;
        }

        public async Task ChangeOrderStatus(OrderParamPost param)
        {
            using var conn = await _context.CreateConnectionAsync();

            var idCustomer = await conn.QuerySingleOrDefaultAsync<Nullable<int>>("select idCustomer from Sales.Orders where id = @ID and orderYear = @OrderYear", param);
            if (idCustomer == null)
                throw new AppException($"No fué posible encontrar la orden #{param.ID}", true);

            var custParam = new { id = idCustomer.Value };
            var account = await conn.QuerySingleOrDefaultAsync<AccountModel>("select top 1 * from Sales.Customers where id = @id", custParam);
            if (account == null)
                throw new AppException("No fué posible encontrar los datos del cliente, verifique con el administrador");

            //Send Email Logic
            await SendStatusEmail(param);

            //Update order status
            await conn.ExecuteAsync("update Sales.Orders set " +
                "IdStatus = @IdStatus, " +
                "Remark = @Remark, " +
                "PaymentCancelation = @PaymentCancelation " +
                "where id = @ID and orderYear = @OrderYear", param);
        }

        private async Task SendStatusEmail(OrderParamPost param)
        {
            using var conn = await _context.CreateConnectionAsync();

            string template = "templates/";
            string subject = string.Empty;
            switch (param.IdStatus)
            {
                case (int)OrderStatus.InProcess:
                    template += "status_in_process.html";
                    subject = "En preparación";
                    break;
                case (int)OrderStatus.InDelivery:
                    template += "status_in_delivery.html";
                    subject = "En ruta de entrega";
                    break;
                case (int)OrderStatus.Delivered:
                    template += "status_delivered.html";
                    subject = "Hemos entregado tu";
                    break;
                case (int)OrderStatus.Cancelled:
                    template += "status_cancelled.html";
                    subject = "Cancelación de";
                    break;
            }

            var builder = GetHtmlTemplateString(template);
            var productsBuilder = GetHtmlTemplateString("templates/status_products.html");
            var discountBuilder = GetHtmlTemplateString("templates/status_discount.html");

            var order = await conn.QuerySingleOrDefaultAsync<OrderPost>("select top 1 * from Admon.ViewOrders where id = @id and orderYear = @orderYear", param);
            var products = await conn.QueryAsync<OrderProduct>("select * from Admon.ViewOrderProducts where idOrder = @id and orderYear = @orderYear", param);

            //{0} Name
            //{1} Quantity
            //{2} Price
            string productsTemplate = string.Empty;
            foreach (var p in products)
            {
                var subtotal = p.FinalPrice * p.Quantity;
                productsTemplate += string.Format(productsBuilder.HtmlBody, p.Name, p.Quantity, subtotal);
            }

            //{0} Discount
            string discountTemplate = string.Empty;
            if (order.Discount != null)
            {
                discountTemplate = string.Format(discountBuilder.HtmlBody, order.Discount.Value);
            }

            //{0} Order no.
            //{1} Products
            //{2} Delivery price
            //{3} Discount
            //{4} Total
            //{5} Delivery date and Delivery time
            //{6} Delivery Name
            //{7} Street and Number
            //{8} Suburb, Zipcode, Town, State
            //{9} Phone
            //{10} Note
            //{11} Remark
            string body = string.Format(builder.HtmlBody,
                $"{order.OrderYear}{order.ID}",
                productsTemplate,
                order.DeliveryCost,
                discountTemplate,
                order.TotalPrice,
                $"{order.DeliveryDate:d 'de' MMMM 'de' yyyy}, {order.DeliveryTime}",
                order.NameDelivery,
                $"{order.Street} {order.DeliveryNumber}",
                $"{order.Suburb}, C.P. {order.ZipCode}, {order.Town}, {order.DeliveryState}",
                order.DeliveryPhone,
                $"{order.Note} | {order.Sender}",
                param.Remark);

            await _emailService.SendCustomer(
                to: order.CustomerEmail,
                subject: $"{subject} orden no. {order.OrderYear}{order.ID}",
                html: body);
        }

        public async Task<IEnumerable<OrderProduct>> GetOrderProducts(OrderParamPost param)
        {
            using var conn = await _context.CreateConnectionAsync();

            var list = await conn.QueryAsync<OrderProduct>("select * from Admon.ViewOrderProducts where idOrder = @ID and orderYear = @OrderYear", param);

            return list;
        }

        public async Task<CustomerDeliveryModel> GetDeliveryOrder(int idDelivery)
        {
            using var conn = await _context.CreateConnectionAsync();

            var param = new { id = idDelivery };
            var delivery = await conn.QuerySingleOrDefaultAsync<CustomerDeliveryModel>("select * from Sales.CustomerDeliveries where idDelivery = @id", param);
            if (delivery == null)
                throw new AppException("No fué posible encontrar la dirección de entrega, verifique con el administrador");

            return delivery;
        }

        private BodyBuilder GetHtmlTemplateString(string path)
        {
            string template = Path.Combine(_env.WebRootPath, path);
            var builder = new BodyBuilder();
            using var stream = File.OpenText(template);
            builder.HtmlBody = stream.ReadToEnd();

            return builder;
        }

        public async Task<IEnumerable<CatalogModel>> GetNextOrderStatus(int id, int orderYear)
        {
            using var conn = await _context.CreateConnectionAsync();

            var idStatus = await conn.QuerySingleOrDefaultAsync<int>("select top 1 idStatus from Sales.Orders " +
                "where id = @id and orderYear = @orderYear", new { id, orderYear });

            var ids = Enum.GetValues(typeof(OrderStatus)).Cast<int>().Where(i => i != idStatus);

            var orderStatus = await conn.QueryAsync<CatalogModel>("select * from Sales.OrderStatus where id in @ids", new { ids });

            return orderStatus;
        }

        public async Task<IEnumerable<CartItems>> GetCartItems()
        {
            using var conn = await _context.CreateConnectionAsync();

            var items = await conn.QueryAsync<CartItems>("select * from Market.ViewCart order by deliveryDate");

            return items;
        }
    }
}