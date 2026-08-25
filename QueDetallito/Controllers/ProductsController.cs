using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using QueDetallito.Data;
using QueDetallito.Models;
using QueDetallito.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Dapper;
using System.Data;
using QueDetallito.Services;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using QueDetallito.Entities.Sales;
using QueDetallito.Models.Sales;

namespace QueDetallito.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly IProductService _productService;

        public ProductsController(IProductService productService)
        {
            _productService = productService;
        }

        [HttpGet]
        public async Task<IActionResult> GetProducts()
        {
            var products = await _productService.GetProducts();
            return Ok(products);
        }

        [HttpGet("GetPromos")]
        public async Task<IActionResult> GetPromos()
        {
            var promos = await _productService.GetPromos();
            return Ok(promos);
        }

        [HttpGet("GetSeasonPromos")]
        public async Task<IActionResult> GetSeasonPromos()
        {
            var seasons = await _productService.GetSeasonPromos();
            return Ok(seasons);
        }

        [HttpGet("GetProduct/{id}")]
        public async Task<IActionResult> GetProduct(int id)
        {
            var product = await _productService.GetProduct(id);
            return Ok(product);
        }

        [HttpGet("GetDeliveryDates/{nextDay}")]
        public IActionResult GetDeliveryDates(int nextDay)
        {
            var dates = new { From = DateTime.Now.LocalTime().AddDays(nextDay), To = DateTime.Now.LocalTime().AddMonths(2) };
            return Ok(dates);
        }

        [HttpGet("GetHolidays")]
        public async Task<IActionResult> GetHolidays()
        {
            var dates = await _productService.GetHolidays();
            return Ok(dates);
        }

        [HttpPost("GetDeliveryTimes")]
        public async Task<IActionResult> GetDeliveryTimes(DateTimePost post)
        {
            var times = await _productService.GetDeliveryTimes(post.Date);
            return Ok(times);
        }

        [Authorize]
        [HttpPost("GetWishProducts")]
        public async Task<IActionResult> GetWishProducts([FromBody]int[] idProducts = null)
        {
            var wishProducts = await _productService.GetWishProducts(GetAccountId(), idProducts);
            return Ok(wishProducts);
        }

        [HttpPost("GetWishProductsAnonym")]
        public async Task<IActionResult> GetWishProductsAnonym([FromBody]int[] idProducts)
        {
            var wishProducts = await _productService.GetWishProductsAnonym(idProducts);
            return Ok(wishProducts);
        }

        [Authorize]
        [HttpPut("AddWishlistProduct")]
        public async Task<IActionResult> AddWishlistProduct([FromBody]int idProduct)
        {
            await _productService.AddWishProduct(GetAccountId(), idProduct);
            return Ok(new { message = "Agregado como favorito, ¡no esperes más para regalarlo!" });
        }

        [Authorize]
        [HttpDelete("DeleteWishProduct/{id}")]
        public async Task<IActionResult> DeleteWishProduct(int id)
        {
            await _productService.DeleteWishProduct(GetAccountId(), id);
            return Ok(new { message = "Listo, ya no lo verás como favorito" });
        }

        [Authorize]
        [HttpPost("GetCartItems")]
        public async Task<IActionResult> GetCartItems(IEnumerable<CartItemModel> items = null)
        {
            var cartItems = await _productService.GetCartItems(GetAccountId(), items);

            return Ok(cartItems);
        }

        [AllowAnonymous]
        [HttpPost("GetCartItemsAnonym")]
        public async Task<IActionResult> GetCartItemsAnonym(IEnumerable<CartItemModel> items)
        {
            var cartItems = await _productService.GetCartItemsAnonym(items);

            return Ok(cartItems);
        }

        [Authorize]
        [HttpPut("AddCartItem")]
        public async Task<IActionResult> AddCartItem(CartItemModel cart)
        {
            await _productService.AddCartItem(GetAccountId(), cart);

            return Ok(new { message = "Listo, agregamos el producto a tu carrito" });
        }

        [Authorize]
        [HttpPatch("ChangeCartDateTime")]
        public async Task<IActionResult> ChangeCartDateTime(CartDateTime cart)
        {
            cart.IdCustomer = GetAccountId();
            await _productService.ChangeCartDateTime(cart);

            return Ok(new { message = "Se actualizó tu carrito" });
        }

        [Authorize]
        [HttpDelete("DeleteCartItem/{idProduct}/{idVariant}")]
        public async Task<IActionResult> DeleteCartItem(int idProduct, int idVariant)
        {
            await _productService.DeleteCartItem(GetAccountId(), idProduct, idVariant);
            return Ok(new { message = "Eliminaste el producto de tu carrito" });
        }

        [HttpGet("GetSearchProducts/{term}")]
        public async Task<IActionResult> GetSearchProducts(string term)
        {
            var products = await _productService.SearchProducts(term);
            return Ok(products);
        }

        [HttpPost("VerifyCartDateTime")]
        public async Task<IActionResult> VerifyCartDateTime(CartItemModel cart)
        {
            var verification = await _productService.VerifyCartDateTime(cart);
            return Ok(verification);
        }

        [Authorize]
        [HttpPut("AddReview")]
        public async Task<IActionResult> AddReview(ReviewModel review)
        {
            await _productService.AddReview(review);
            return Ok(new { message = "Agregaste una opinión" });
        }

        [HttpGet("GetProductReviews/{idProduct}")]
        public async Task<IActionResult> GetProductReviews(int idProduct)
        {
            var reviews = await _productService.GetProductReviews(idProduct);
            return Ok(reviews);
        }

        private int GetAccountId()
        {
            var claims = HttpContext.User.Claims;
            var accountId = int.Parse(claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier).Value);
            return accountId;
        }
    }
}
