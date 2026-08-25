using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QueDetallitoAdmin.Entities.Sales;
using QueDetallitoAdmin.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace QueDetallitoAdmin.Controllers
{
    [ApiController]
    [Route("[controller]")]
    [Authorize]
    public class SalesController : Controller
    {
        private readonly ISalesService _salesService;
        public SalesController(ISalesService salesService)
        {
            _salesService = salesService;
        }

        [HttpGet]
        public async Task<IActionResult> GetLastestSales()
        {
            var list = await _salesService.GetLastestSales();
            return Ok(list);
        }

        [HttpGet("GetSalesYears")]
        public async Task<IActionResult> GetSalesYears()
        {
            var list = await _salesService.GetSalesYears();
            return Ok(list);
        }

        [HttpGet("GetSales/{year}/{idStatus}")]
        public async Task<IActionResult> GetSales(int year, int idStatus)
        {
            var param = new OrderParamPost { OrderYear = year, IdStatus = idStatus };
            var list = await _salesService.GetSales(param);
            return Ok(list);
        }

        [HttpGet("GetSale/{id}/{year}")]
        public async Task<IActionResult> GetSale(int id, int year)
        {
            var param = new OrderParamPost { ID = id, OrderYear = year };
            var order = await _salesService.GetSale(param);
            return Ok(order);
        }

        [HttpPost("ChangeOrderStatus")]
        public async Task<IActionResult> ChangeOrderStatus(OrderParamPost param)
        {
            await _salesService.ChangeOrderStatus(param);
            return Ok(new { message = $"Se cambió el estatus de la orden #{param.ID}" });
        }

        [HttpGet("GetOrderProducts/{id}/{year}")]
        public async Task<IActionResult> GetOrderProducts(int id, int year)
        {
            var param = new OrderParamPost { ID = id, OrderYear = year };
            var list = await _salesService.GetOrderProducts(param);
            return Ok(list);
        }

        [HttpGet("GetDeliveryOrder/{id}")]
        public async Task<IActionResult> GetDeliveryOrder(int id)
        {
            var delivery = await _salesService.GetDeliveryOrder(id);
            return Ok(delivery);
        }

        [HttpGet("GetNextOrderStatus/{id}/{orderYear}")]
        public async Task<IActionResult> GetNextOrderStatus(int id, int orderYear)
        {
            var orderStatus = await _salesService.GetNextOrderStatus(id, orderYear);
            return Ok(orderStatus);
        }

        [HttpGet("GetCartItems")]
        public async Task<IActionResult> GetCartItems()
        {
            var items = await _salesService.GetCartItems();
            return Ok(items);
        }
    }
}
