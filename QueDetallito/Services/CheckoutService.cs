using QueDetallito.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Dapper;
using QueDetallito.Models;
using Newtonsoft.Json;
using QueDetallito.Handlers;
using Stripe;
using QueDetallito.Entities.Checkout;
using PayPalCheckoutSdk.Orders;
using QueDetallito.Models.Checkout;
using Microsoft.AspNetCore.Hosting;
using System.IO;
using MimeKit;
using QueDetallito.Entities;

namespace QueDetallito.Services
{
    public interface ICheckoutService
    {
        Task<CheckoutResponse> CreatePaymentIntent(OrderPost post);
        Task<CheckoutResponse> CreatePaymentIntentConfirm(OrderPost post);
        Task<CheckoutResponse> CreateOxxoPayment(OrderPost post);
        Task<PaypalOrder> CreatePaypalOrder(OrderPost post);
        Task<CheckoutResponse> CapturePaypalOrder(OrderPost post);
        Task<CheckoutDiscount> GetDiscountFromCode(DiscountPost post);
        Task<OrdersView> GetOrderById(int idOrder, int orderYear);
        Task<IEnumerable<OrderProductsView>> GetOrderProducts(int idOrder, int orderYear);
        Task<IEnumerable<OrdersView>> GetOrdersByPeriod(int id, int period);
        Task<string> CancelOrder(OrderNo no);
    }
    public class CheckoutService : ICheckoutService
    {
        private enum OrderStatus
        {
            Created = 1,
            Cancelled = 2,
            PaymentPending = 3,
            PaymentRejected = 4,
            Payed = 5
        };
        private enum PaymentMethod
        {
            Card = 1,
            Paypal = 2,
            Oxxo = 3
        };
        private decimal ShippingCost = 99;
        private readonly IDatabaseConnection _context;
        private readonly IWebHostEnvironment _env;
        private readonly IEmailService _email;
        private readonly IProductService _product;
        public CheckoutService(IDatabaseConnection context, IWebHostEnvironment env, IEmailService email, IProductService product)
        {
            _context = context;
            _env = env;
            _email = email;
            _product = product;
        }

        public async Task<CheckoutResponse> CreatePaymentIntent(OrderPost post)
        {
            var total = await GetTotalOfOrder(post);

            //Verifica Fecha y Hora
            await _product.VerifyCartDateTime(new CartItemModel
            {
                DeliveryDate = total.Item2.First().DeliveryDate,
                IdDeliveryTime = total.Item2.First().IdDeliveryTime
            });

            total.Item1 *= 100;

            var intentService = new PaymentIntentService();
            PaymentIntent payment = null;
            var createOptions = new PaymentIntentCreateOptions
            {
                PaymentMethod = post.MethodId,
                Amount = (long)total.Item1,
                Currency = "mxn",
                ConfirmationMethod = "manual",
                Confirm = true
            };

            try
            {
                payment = await intentService.CreateAsync(createOptions);
            }
            catch (StripeException e)
            {
                throw new AppException(e.Message);
            }

            return await HandlePaymentIntent(post, payment);
        }

        public async Task<CheckoutResponse> CreatePaymentIntentConfirm(OrderPost post)
        {
            var paymentService = new PaymentIntentService();
            PaymentIntent payment = null;
            try
            {
                payment = await paymentService.ConfirmAsync(post.IntentId);
            }
            catch (StripeException e)
            {
                throw new AppException(e.Message);
            }

            return await HandlePaymentIntent(post, payment);
        }

        private async Task<CheckoutResponse> HandlePaymentIntent(OrderPost post, PaymentIntent intent)
        {
            CheckoutResponse response = new CheckoutResponse();
            if (intent.Status == "succeeded")
            {
                post.IdStatus = (int)OrderStatus.Payed;
                post.IdPaymentMethod = (int)PaymentMethod.Card;
                var detail = intent.Charges.Data[0].PaymentMethodDetails.Card;
                post.PaymentDetails = intent.Id;
                post.PaymentMethodDetails = detail.Brand.ToUpperFirst() + " - " + detail.Last4;
                var id = await CreateCustomerOrder(post);

                response.Success = true;
                response.IdOrder = id.Item1;
                response.OrderYear = id.Item2;
            }
            else if (intent.Status == "requires_action" && intent.NextAction.Type == "use_stripe_sdk")
            {
                response.Success = false;
                response.RequiresAction = true;
                response.ClientSecret = intent.ClientSecret;
            }
            else
            {
                throw new AppException($"Lo sentimos, no fué posible realizar el pago, el estatus es {intent.Status}");
            }
            return response;
        }

        public async Task<CheckoutResponse> CreateOxxoPayment(OrderPost post)
        {
            var total = await GetTotalOfOrder(post);

            //Verifica Fecha y Hora
            await _product.VerifyCartDateTime(new CartItemModel
            {
                DeliveryDate = total.Item2.First().DeliveryDate,
                IdDeliveryTime = total.Item2.First().IdDeliveryTime
            });

            total.Item1 *= 100;

            var options = new PaymentIntentCreateOptions
            {
                Amount = (long)total.Item1,
                Currency = "mxn",
                PaymentMethodTypes = new List<string> { "oxxo" },
                PaymentMethodOptions = new PaymentIntentPaymentMethodOptionsOptions
                {
                    Oxxo = new PaymentIntentPaymentMethodOptionsOxxoOptions
                    {
                        ExpiresAfterDays = 1
                    }
                }
            };

            var paymentService = new PaymentIntentService();
            PaymentIntent paymentIntent = null;
            try
            {
                paymentIntent = await paymentService.CreateAsync(options);
            }
            catch (StripeException e)
            {
                throw new AppException(e.Message);
            }

            post.IdStatus = (int)OrderStatus.PaymentPending;
            post.IdPaymentMethod = (int)PaymentMethod.Oxxo;
            post.PaymentDetails = paymentIntent.Id;
            var id = await CreateCustomerOrder(post);

            var response = new CheckoutResponse
            {
                Success = true,
                ClientSecret = paymentIntent.ClientSecret,
                IdOrder = id.Item1,
                OrderYear = id.Item2
            };
            return response;
        }

        public async Task<PaypalOrder> CreatePaypalOrder(OrderPost post)
        {
            var request = new OrdersCreateRequest();
            request.Prefer("return=representation");

            var total = await GetTotalOfOrder(post);
            
            //Verifica Fecha y Hora
            await _product.VerifyCartDateTime(new CartItemModel
            {
                DeliveryDate = total.Item2.First().DeliveryDate,
                IdDeliveryTime = total.Item2.First().IdDeliveryTime
            });

            var items = total.Item2.Select(i => new Item
            {
                Name = i.Name,
                UnitAmount = new Money
                {
                    CurrencyCode = "MXN",
                    Value = i.FinalPrice.ToString()
                },
                Quantity = i.Quantity.ToString()
            });

            var order = new OrderRequest()
            {
                CheckoutPaymentIntent = "CAPTURE",
                ApplicationContext = new ApplicationContext()
                {
                    BrandName = "Que Detallito",
                    UserAction = "CONTINUE"
                },
                PurchaseUnits = new List<PurchaseUnitRequest>()
                {
                    new PurchaseUnitRequest()
                    {
                        AmountWithBreakdown = new AmountWithBreakdown()
                        {
                            CurrencyCode = "MXN",
                            Value = total.Item1.ToString(),
                            AmountBreakdown = new AmountBreakdown()
                            {
                                ItemTotal = new Money
                                {
                                    CurrencyCode = "MXN",
                                    Value = (total.Item1 - ShippingCost).ToString()
                                },
                                Shipping = new Money
                                {
                                    CurrencyCode = "MXN",
                                    Value = ShippingCost.ToString()
                                },
                                Discount = new Money
                                {
                                    CurrencyCode = "MXN",
                                    Value = total.Item3.ToString()
                                }
                            }
                        },
                        Items = items.ToList()
                    }
                }
            };
            request.RequestBody(order);

            PayPalHttp.HttpResponse response = null;
            try
            {
                response = await PaypalClient.Client().Execute(request);
            }
            catch (Exception e)
            {
                throw new AppException(e.Message);
            }
            var result = response.Result<PayPalCheckoutSdk.Orders.Order>();

            return new PaypalOrder { OrderID = result.Id, Status = result.Status };
        }

        public async Task<CheckoutResponse> CapturePaypalOrder(OrderPost post)
        {
            var request = new OrdersCaptureRequest(post.OrderId);
            request.Prefer("return=representation");
            request.RequestBody(new OrderActionRequest());

            PayPalHttp.HttpResponse response = null;
            try
            {
                response = await PaypalClient.Client().Execute(request);
            }
            catch (Exception e)
            {
                throw new AppException(e.Message);
            }
            
            var order = response.Result<PayPalCheckoutSdk.Orders.Order>();
            post.IdStatus = (int)OrderStatus.Payed;
            post.IdPaymentMethod = (int)PaymentMethod.Paypal;
            foreach (var unit in order.PurchaseUnits)
            {
                foreach (var capture in unit.Payments.Captures)
                {
                    post.PaymentDetails += capture.Id;
                }
            }

            var id = await CreateCustomerOrder(post);
            var result = new CheckoutResponse
            {
                Success = true,
                IdOrder = id.Item1,
                OrderYear = id.Item2
            };

            return result;
        }

        private async Task<(int, int)> CreateCustomerOrder(OrderPost post)
        {
            using var conn = await _context.CreateConnectionAsync();

            //Obtiene productos registrados en el carrito
            var cartItems = await GetCartItems(post.IdCustomer);

            //Obtiene último ID por año
            var today = DateTime.Now.LocalTime();
            string sequence = $"Sales.OrderId{today:yy}";
            var idOrder = await conn.QuerySingleOrDefaultAsync<int>($"select next value for {sequence}");

            //Genera nueva orden
            var item = cartItems.OrderByDescending(c => c.DeliveryDate).FirstOrDefault();
            var orderParam = new OrderModel
            {
                ID = idOrder,
                OrderYear = today.Year,
                IdCustomer = post.IdCustomer,
                IdDelivery = post.IdDelivery,
                IdStatus = post.IdStatus,
                IdPaymentMethod = post.IdPaymentMethod,
                IdDiscount = post.IdDiscount,
                IdDeliveryTime = item.IdDeliveryTime,
                DeliveryCost = ShippingCost,
                DeliveryDate = item.DeliveryDate,
                Font = post.Font,
                Note = post.Note,
                Sender = post.Sender,
                PaymentDetails = post.PaymentDetails,
                PaymentMethodDetails = post.PaymentMethodDetails,
                Created = today
            };
            try
            {
                await conn.ExecuteAsync("insert into Sales.Orders values (" +
                    "@ID, @OrderYear, @IdCustomer, @IdDelivery, @IdStatus, @IdPaymentMethod, @IdDiscount, @IdDeliveryTime, @DeliveryCost, @DeliveryDate, " +
                    "@Font, @Note, @Sender, @PaymentDetails, @PaymentMethodDetails, @Created, @Modified, @Remark, @PaymentCancelation)", orderParam);
            }
            catch (Exception e)
            {
                throw new AppException(e.Message);
            }

            //Guarda los productos de la orden
            var products = cartItems.Select(p => new
            {
                idOrder,
                orderParam.OrderYear,
                p.IdProduct,
                p.IdVariant,
                p.Quantity,
                p.Cost,
                p.Price,
                p.Discount,
                p.SpecialTxt,
                Review = false
            });
            await conn.ExecuteAsync("insert into Sales.OrderProducts values (" +
                "@idOrder, @OrderYear, @IdProduct, @IdVariant, @Quantity, @Cost, @Price, @Discount, @SpecialTxt, @Review)", products);

            //Vacía el carrito
            await conn.ExecuteAsync("delete Sales.Cart where idCustomer = @IdCustomer", new { post.IdCustomer });

            //Desactiva el código de descuento
            if (orderParam.IdDiscount != null)
            {
                await conn.ExecuteAsync("update Sales.Discounts set active = @active where id = @IdDiscount and idCustomer = @idCustomer",
                    new { IdDiscount = orderParam.IdDiscount.Value, active = false, orderParam.IdCustomer });
            }

            //Genera código de descuento para 2da compra
            var first = await conn.QuerySingleOrDefaultAsync<int>("select count(*) from Sales.Orders " +
                "where idCustomer = @IdCustomer", new { orderParam.IdCustomer });
            DiscountsModel discountParam = null;
            if (first == 1)
            {
                discountParam = new DiscountsModel
                {
                    DiscountCode = "EXTRA15",
                    Discount = 15,
                    ValidFrom = today,
                    ValidTo = today.AddMonths(1),
                    IdCustomer = orderParam.IdCustomer,
                    Active = true
                };
                await conn.ExecuteAsync("insert into Sales.Discounts values (" +
                    "@discountCode, @discount, @ValidFrom, @ValidTo, @IdCustomer, @active)", discountParam);
            }

            //Enviar correo
            await SendOrderEmail(orderParam, cartItems, discountParam);

            return (orderParam.ID, orderParam.OrderYear);
        }

        private async Task<IEnumerable<CartItem>> GetCartItems(int id)
        {
            using var conn = await _context.CreateConnectionAsync();
            var param = new { id };
            var cartItems = await conn.QueryAsync<CartItem>("select * from Market.ViewCartItems where idCustomer = @id", param);
            if (cartItems == null || !cartItems.Any())
                throw new AppException("No existen productos en el carrito, para generar una orden primero debes agregar productos");

            return cartItems;
        }

        private async Task<decimal> GetOrderDiscount(int idDiscount)
        {
            using var conn = await _context.CreateConnectionAsync();
            var param = new { idDiscount, today = DateTime.Now.LocalTime(), active = true };
            var discount = await conn.QuerySingleOrDefaultAsync<decimal>("select discount from Sales.Discounts " +
                "where id = @idDiscount and @today between ValidFrom and ValidTo and active = @active", param);

            return discount;
        }

        private async Task<(decimal, IEnumerable<CartItem>, decimal)> GetTotalOfOrder(OrderPost post)
        {
            var products = await GetCartItems(post.IdCustomer);
            //Total del precio y cantidades
            var total = products.Sum(p => p.FinalPrice * p.Quantity);

            //Descuento al pedido si existe
            decimal discount = 0;
            if (post.IdDiscount != null)
            {
                var discountPerc = await GetOrderDiscount(post.IdDiscount.Value);
                discount = total * (discountPerc / 100);
                total *= 1 - (discountPerc / 100);
            }

            //Costo de entrega
            total += ShippingCost;
            
            return (total, products, discount);
        }

        private async Task SendOrderEmail(OrderModel order, IEnumerable<CartItem> cartItems, DiscountsModel extraDiscount = null)
        {
            using var conn = await _context.CreateConnectionAsync();

            var builder = GetHtmlTemplateString("templates/payment.html");
            var productBuilder = GetHtmlTemplateString("templates/payment_products.html");
            var discountBuilder = GetHtmlTemplateString("templates/payment_discount.html");
            var nextDisBuilder = GetHtmlTemplateString("templates/payment_next_discount.html");
            var newOrderBuilder = GetHtmlTemplateString("templates/new_order.html");

            //{0} Name
            //{1} Quantity
            //{2} Price
            string products = string.Empty;
            decimal total = 0;
            foreach (var item in cartItems)
            {
                var subtotal = item.FinalPrice * item.Quantity;
                total += subtotal;
                products += string.Format(productBuilder.HtmlBody, item.Name, item.Quantity, subtotal);
            }
            total += order.DeliveryCost;

            var orderDetails = await conn.QuerySingleOrDefaultAsync<OrderDetailsEmail>("select top 1 * from Market.ViewOrderDetailsEmail " +
                "where idOrder = @id and orderYear = @year", new { id = order.ID, year = order.OrderYear });

            //{0} Discount
            string discount = string.Empty;
            if (order.IdDiscount != null)
            {
                discount = string.Format(discountBuilder.HtmlBody, orderDetails.Discount.Value);
                total *= 1 - (orderDetails.Discount.Value / 100);
            }

            //{0} Next Discount
            //{1} Discount Code
            //{2} ValidTo
            string nextDiscount = string.Empty;
            if (extraDiscount != null)
            {
                nextDiscount = string.Format(nextDisBuilder.HtmlBody,
                    extraDiscount.Discount, extraDiscount.DiscountCode, extraDiscount.ValidTo.ToString("d"));
            }

            //{0} Created
            //{1} PaymentMethod
            //{2} IdOrder
            //{3} Products
            //{4} DeliveryCost
            //{5} Discount
            //{6} Total
            //{7} DeliveryDate and DeliveryTime
            //{8} DeliveryName
            //{9} Street and Number
            //{10} Suburb, Zipcode, Town, State
            //{11} Phone
            //{12} Note
            //{13} Next Discount
            string body = string.Format(builder.HtmlBody,
                order.Created.ToString("d 'de' MMMM 'de' yyyy"),
                order.IdPaymentMethod == (int)PaymentMethod.Card ? order.PaymentMethodDetails : orderDetails.PaymentMethod,
                $"{order.OrderYear}{order.ID}",
                products,
                ShippingCost,
                discount,
                total,
                $"{order.DeliveryDate:d 'de' MMMM 'de' yyyy}, {orderDetails.DeliveryTime}",
                orderDetails.NameDelivery,
                $"{orderDetails.Street} {orderDetails.Number}",
                $"{orderDetails.Suburb}, C.P. {orderDetails.ZipCode}, {orderDetails.Town}, {orderDetails.State}",
                orderDetails.Phone,
                (order.Note ?? "Sin mensaje") + " | " + (order.Sender ?? "Anónimo"),
                nextDiscount);

            await _email.Send(
                to: orderDetails.Email,
                subject: $"Confirmación de Compra Orden No. {order.OrderYear}{order.ID}",
                html: body);

            //{0} Order year + Order id
            //{1} Products
            //{2} Delivery Cost
            //{3} Discount
            //{4} Total
            //{5} Delivery Date and Time
            //{6} Suburb, Zipcode, Town, State
            //{7} Phone
            //{8} OrderId
            //{9} Order Year
            string bodyNewOrder = string.Format(newOrderBuilder.HtmlBody,
                $"{order.OrderYear}{order.ID}",
                products,
                ShippingCost,
                discount,
                total,
                $"{order.DeliveryDate:dddd d 'de' MMMM 'de' yyyy}, {orderDetails.DeliveryTime}",
                $"{orderDetails.Suburb}, C.P. {orderDetails.ZipCode}, {orderDetails.Town}, {orderDetails.State}",
                orderDetails.Phone,
                order.ID,
                order.OrderYear);

            await _email.Send(
                to: "sales@quedetallito.com",
                subject: "Nueva venta",
                html: bodyNewOrder);
        }

        private BodyBuilder GetHtmlTemplateString(string path)
        {
            string template = Path.Combine(_env.WebRootPath, path);
            var builder = new BodyBuilder();
            using var stream = System.IO.File.OpenText(template);
            builder.HtmlBody = stream.ReadToEnd();

            return builder;
        }

        public async Task<CheckoutDiscount> GetDiscountFromCode(DiscountPost post)
        {
            using var conn = await _context.CreateConnectionAsync();

            var validDiscount = new CheckoutDiscount();

            var userDiscount = await conn.QuerySingleOrDefaultAsync<DiscountsModel>("select top 1 * from Sales.Discounts " +
                "where discountCode = @code and IdCustomer = @IdCustomer", new { code = post.DiscountCode, post.IdCustomer });

            var today = DateTime.Now.LocalTime();

            if (userDiscount != null)
            {
                if (!userDiscount.Active)
                    throw new AppException("El código ingresado no es válido");
                else if (userDiscount.ValidFrom > today)
                    throw new AppException($"El descuento es válido a partir del {userDiscount.ValidFrom.ToString("d")}");
                else if (userDiscount.ValidTo < today)
                    throw new AppException("Lo sentimos, el descuento que solicitas ya venció");

                validDiscount.ID = userDiscount.ID;
                validDiscount.DiscountCode = userDiscount.DiscountCode;
                validDiscount.Discount = userDiscount.Discount;
            }
            else
            {
                var discount = await conn.QuerySingleOrDefaultAsync<DiscountsModel>("select top 1 * from Sales.Discounts " +
                    "where discountCode = @code and IdCustomer is null", new { code = post.DiscountCode });

                if (discount != null)
                    throw new AppException("El código ingresado no es válido");
                else if (!discount.Active)
                    throw new AppException("El código ingresado no es válido");
                else if (discount.ValidFrom > today)
                    throw new AppException($"El descuento es válido a partir del {discount.ValidFrom.ToString("d")}");
                else if (discount.ValidTo < today)
                    throw new AppException("Lo sentimos, el descuento que solicitas ya venció");

                validDiscount.ID =discount.ID;
                validDiscount.DiscountCode = discount.DiscountCode;
                validDiscount.Discount = discount.Discount;
            }

            return validDiscount;
        }

        public async Task<OrdersView> GetOrderById(int idOrder, int orderYear)
        {
            using var conn = await _context.CreateConnectionAsync();

            var order = await conn.QuerySingleOrDefaultAsync<OrdersView>("select top 1 * from Admon.ViewOrders " +
                "where id = @idOrder and orderYear = @orderYear", new { idOrder, orderYear });

            return order;
        }

        public async Task<IEnumerable<OrderProductsView>> GetOrderProducts(int idOrder, int orderYear)
        {
            using var conn = await _context.CreateConnectionAsync();

            var products = await conn.QueryAsync<OrderProductsView>("select * from Admon.ViewOrderProducts " +
                "where idOrder = @idOrder and orderYear = @orderYear", new { idOrder, orderYear });

            return products;
        }

        public async Task<IEnumerable<OrdersView>> GetOrdersByPeriod(int id, int period)
        {
            using var conn = await _context.CreateConnectionAsync();

            var orders = await conn.QueryAsync<OrdersView>("select * from Admon.ViewOrders " +
                "where idCustomer = @id and created between @period and @today order by created desc",
                new { id, today = DateTime.Now.LocalTime(), period = DateTime.Now.LocalTime().AddMonths(period * -1) });

            return orders;
        }

        public async Task<string> CancelOrder(OrderNo no)
        {
            using var conn = await _context.CreateConnectionAsync();

            var order = await conn.QuerySingleOrDefaultAsync<OrderModel>("select top 1 * from Sales.Orders " +
                "where id = @idOrder and orderYear = @orderYear", new { no.IdOrder, no.OrderYear });

            if (order == null)
                throw new AppException("Lo sentimos, ocurrió un error al buscar el pedido, favor de intentar más tarde");
            else if (order.IdStatus == (int)OrderStatus.Cancelled)
                throw new AppException("El pedido ya se encuentra cancelado");
            else if (order.IdStatus == 8)
                throw new AppException("No es posible cancelar pedidos que ya fueron entregados");
            else if (order.IdStatus > (int)OrderStatus.Payed)
                throw new AppException("Lo sentimos, no es posible cancelar el pedido ya que está siendo procesado");

            string refund = string.Empty;
            string refundDetail = string.Empty;
            if (order.IdPaymentMethod == (int)PaymentMethod.Card)
            {
                refund = await RefundStripe(order.PaymentDetails);
            }
            else if (order.IdPaymentMethod == (int)PaymentMethod.Paypal)
            {
                var paypal = await RefundPaypal(order.PaymentDetails);
                refund = paypal.Item1;
                refundDetail = paypal.Item2;
            }

            order.PaymentCancelation = refund;
            order.Modified = DateTime.Now.ToLocalTime();
            order.IdStatus = (int)OrderStatus.Cancelled;
            order.Remark = $"Cancelaste tu pedido y se ha realizado un reembolso por el total de la compra. {refundDetail}".Trim();

            //Send email to client
            await SendCancelationEmail(order);

            //Save data
            await conn.ExecuteAsync("update Sales.Orders set " +
                "paymentCancelation = @paymentCancelation, " +
                "Modified = @Modified, " +
                "IdStatus = @IdStatus, " +
                "Remark = @Remark " +
                "where id = @id and orderYear = @orderYear", new { order.ID, order.OrderYear, order.PaymentCancelation, order.Modified, order.IdStatus, order.Remark });

            return order.Remark;
        }

        private async Task<string> RefundStripe(string id)
        {
            var refunds = new RefundService();
            var refundOptions = new RefundCreateOptions
            {
                PaymentIntent = id,
                Reason = "requested_by_customer"
            };

            Stripe.Refund refund = null;
            try
            {
                refund = await refunds.CreateAsync(refundOptions);
            }
            catch (StripeException e)
            {
                throw new AppException(e.Message);
            }

            if (refund.Status == "failed")
                throw new AppException($"Ocurrió un problema con tu tarjeta o banco al solicitar la cancelación: {refund.FailureReason}", true);

            return refund.Id;
        }

        private async Task<(string, string)> RefundPaypal(string id)
        {
            var request = new PayPalCheckoutSdk.Payments.CapturesRefundRequest(id);
            request.Prefer("return=representation");
            var refund = new PayPalCheckoutSdk.Payments.RefundRequest();
            request.RequestBody(refund);

            PayPalHttp.HttpResponse response;
            try
            {
                response = await PaypalClient.Client().Execute(request);
            }
            catch (Exception e)
            {
                throw new AppException(e.Message);
            }

            var result = response.Result<PayPalCheckoutSdk.Payments.Refund>();
            if (result.Status == "CANCELLED")
                throw new AppException("No ha sido posible realizar el reembolso con Paypal, porfavor intenta más tarde", true);
            string detail = string.Empty;
            if (result.Status == "PENDING")
                detail = result.StatusDetails.Reason;

            return (result.Id, detail);
        }

        private async Task SendCancelationEmail(OrderModel no)
        {
            using var conn = await _context.CreateConnectionAsync();

            var order = await conn.QuerySingleOrDefaultAsync<OrdersView>("select top 1 * from Admon.ViewOrders " +
                "where id = @id and orderYear = @orderYear", new { no.ID, no.OrderYear });
            var products = await conn.QueryAsync<OrderProductsView>("select * from Admon.ViewOrderProducts " +
                "where idOrder = @id and orderYear = @orderYear", new { order.ID, order.OrderYear });

            var builder = GetHtmlTemplateString("templates/cancelled.html");
            var productsBuilder = GetHtmlTemplateString("templates/payment_products.html");
            var discountBuilder = GetHtmlTemplateString("templates/payment_discount.html");

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
                no.Remark);

            await _email.Send(
                to: order.CustomerEmail,
                subject: $"Cancelación de Orden No. {order.OrderYear}{order.ID}",
                html: body);
        }
    }
}
