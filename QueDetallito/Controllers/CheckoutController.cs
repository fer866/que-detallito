using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QueDetallito.Entities.Checkout;
using QueDetallito.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace QueDetallito.Controllers
{
    [ApiController]
    [Route("[controller]")]
    [Authorize]
    public class CheckoutController : Controller
    {
        private readonly ICheckoutService _checkoutService;
        public CheckoutController(ICheckoutService checkoutService)
        {
            _checkoutService = checkoutService;
        }

        [HttpPost]
        public async Task<IActionResult> Pay(OrderPost post)
        {
            var claims = HttpContext.User.Claims;
            var idCustomer = int.Parse(claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier).Value);
            post.IdCustomer = idCustomer;

            var response = await _checkoutService.CreatePaymentIntent(post);
            return Ok(response);
        }

        [HttpPost("IntentConfirm")]
        public async Task<IActionResult> IntentConfirm(OrderPost post)
        {
            var claims = HttpContext.User.Claims;
            var idCustomer = int.Parse(claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier).Value);
            post.IdCustomer = idCustomer;

            var response = await _checkoutService.CreatePaymentIntentConfirm(post);
            return Ok(response);
        }

        [HttpPost("IntentOxxo")]
        public async Task<IActionResult> IntentOxxo(OrderPost post)
        {
            var claims = HttpContext.User.Claims;
            var idCustomer = int.Parse(claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier).Value);
            post.IdCustomer = idCustomer;

            var response = await _checkoutService.CreateOxxoPayment(post);
            return Ok(response);
        }

        [HttpPost("CreatePaypalOrder")]
        public async Task<IActionResult> CreatePaypalOrder(OrderPost post)
        {
            var claims = HttpContext.User.Claims;
            var idCustomer = int.Parse(claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier).Value);
            post.IdCustomer = idCustomer;

            var response = await _checkoutService.CreatePaypalOrder(post);
            return Ok(response);
        }

        [HttpPost("CapturePaypalOrder")]
        public async Task<IActionResult> CapturePaypalOrder(OrderPost post)
        {
            var claims = HttpContext.User.Claims;
            var idCustomer = int.Parse(claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier).Value);
            post.IdCustomer = idCustomer;

            var response = await _checkoutService.CapturePaypalOrder(post);
            return Ok(response);
        }

        [HttpGet("GetDiscount/{code}")]
        public async Task<IActionResult> GetDiscount(string code)
        {
            var claims = HttpContext.User.Claims;
            var idCustomer = int.Parse(claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier).Value);
            var discount = await _checkoutService.GetDiscountFromCode(new DiscountPost { IdCustomer = idCustomer, DiscountCode = code });

            return Ok(discount);
        }

        [HttpGet("GetOrderById/{orderYear}/{idOrder}")]
        public async Task<IActionResult> GetOrderById(int orderYear, int idOrder)
        {
            var order = await _checkoutService.GetOrderById(idOrder, orderYear);
            return Ok(order);
        }

        [HttpGet("GetOrderProducts/{orderYear}/{idOrder}")]
        public async Task<IActionResult> GetOrderProducts(int orderYear, int idOrder)
        {
            var products = await _checkoutService.GetOrderProducts(idOrder, orderYear);
            return Ok(products);
        }

        [HttpGet("GetOrdersByPeriod/{period}")]
        public async Task<IActionResult> GetOrdersByPeriod(int period)
        {
            var claims = HttpContext.User.Claims;
            var idCustomer = int.Parse(claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier).Value);
            var orders = await _checkoutService.GetOrdersByPeriod(idCustomer, period);

            return Ok(orders);
        }

        [HttpPost("CancelOrder")]
        public async Task<IActionResult> CancelOrder(OrderNo order)
        {
            var msg = await _checkoutService.CancelOrder(order);
            return Ok(new { message = msg });
        }
    }
}
