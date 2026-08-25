using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using QueDetallitoAdmin.Entities.Production;
using QueDetallitoAdmin.Models.Production;
using QueDetallitoAdmin.Models.Sales;
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
    public class ProductionController : Controller
    {
        private readonly IProductionService _productionService;
        public ProductionController(IProductionService productionService)
        {
            _productionService = productionService;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetCatalogs(int id)
        {
            var catalog = await _productionService.GetCatalogs(new Catalog { IdCatalog = id });
            return Ok(catalog);
        }

        [HttpPut("AddCatalog")]
        public async Task<IActionResult> AddCatalog(Catalog catalog)
        {
            await _productionService.AddCatalog(catalog);
            return Ok(new { message = "Se agregó correctamente la categoría" });
        }

        [HttpPatch("EditCatalog")]
        public async Task<IActionResult> EditCatalog(Catalog catalog)
        {
            await _productionService.EditCatalog(catalog);
            return Ok(new { message = "Se editó correctamente la categoría" });
        }

        [HttpGet("GetProducts")]
        public async Task<IActionResult> GetProducts()
        {
            var products = await _productionService.GetProducts();
            return Ok(products);
        }

        [HttpPut("AddProduct")]
        public async Task<IActionResult> AddProduct(ProductModel product)
        {
            await _productionService.AddProduct(product);
            return Ok(new { message = $"Registraste el producto {product.Name}" });
        }

        [HttpPatch("UpdateProduct")]
        public async Task<IActionResult> UpdateProduct(ProductModel product)
        {
            await _productionService.UpdateProduct(product);
            return Ok(new { message = $"Actualizaste el producto {product.Name}" });
        }

        [HttpDelete("DeleteProduct/{idProduct}")]
        public async Task<IActionResult> DeleteProduct(int idProduct)
        {
            await _productionService.DeleteProduct(idProduct);
            return Ok(new { message = "Eliminaste el producto junto con todas sus variantes e imágenes" });
        }

        [HttpGet("GetVariants/{idProduct}")]
        public async Task<IActionResult> GetVariants(int idProduct)
        {
            var variants = await _productionService.GetVariants(idProduct);
            return Ok(variants);
        }

        [HttpPut("AddVariant")]
        public async Task<IActionResult> AddVariant([FromForm]VariantPost post)
        {

            await _productionService.AddVariant(post);
            return Ok(new { message = $"Registraste la variante {post.Variant.NameVariant}" });
        }

        [HttpPatch("UpdateVariant")]
        public async Task<IActionResult> UpdateVariant(VariantModel variant)
        {
            await _productionService.UpdateVariant(variant);
            return Ok(new { message = $"Actualizaste la variante {variant.NameVariant}" });
        }

        [HttpDelete("DeleteVariant/{idVariant}")]
        public async Task<IActionResult> DeleteVariant(int idVariant)
        {
            await _productionService.DeleteVariant(idVariant);
            return Ok(new { message = "Eliminaste la variante junto con todas sus imágenes" });
        }

        [HttpGet("GetProductImages/{idVariant}")]
        public async Task<IActionResult> GetProductImages(int idVariant)
        {
            var images = await _productionService.GetProductImages(idVariant);
            return Ok(images);
        }

        [HttpPut("AddProductImage")]
        public async Task<IActionResult> AddProductImage([FromForm]ProductImagePost productImage)
        {
            await _productionService.AddProductImage(productImage);
            return Ok(new { message = "¡La imagen se ha agregado!" });
        }

        [HttpPost("DeleteProductImage")]
        public async Task<IActionResult> DeleteProductImage(ProductImageModel productImage)
        {
            await _productionService.DeleteProductImage(productImage);
            return Ok(new { message = "Se eliminó la imagen" });
        }

        [HttpGet("GetCalendarYears")]
        public IActionResult GetCalendarYears()
        {
            var list = new List<int>();
            var today = DateTime.Now;
            list.Add(today.Year);
            list.Add(today.AddYears(1).Year);
            list.Add(today.AddYears(2).Year);

            return Ok(list);
        }

        [HttpGet("GetCalendar/{year}")]
        public async Task<IActionResult> GetCalendar(int year)
        {
            var list = await _productionService.GetCalendar(year);
            return Ok(list);
        }

        [HttpPut("AddCalendarDay")]
        public async Task<IActionResult> AddCalendarDay(CalendarModel day)
        {
            await _productionService.AddCalendarDay(day);
            return Ok(new { message = "Se agregaron los días correctamente" });
        }

        [HttpDelete("DeleteCalendarDay/{id}")]
        public async Task<IActionResult> DeleteCalendarDay(int id)
        {
            await _productionService.DeleteCalendarDay(id);
            return Ok(new { message = "Se eliminó el día del calendario" });
        }

        [HttpGet("GetPromos")]
        public async Task<IActionResult> GetPromos()
        {
            var list = await _productionService.GetPromos();
            return Ok(list);
        }

        [HttpPut("AddPromo")]
        public async Task<IActionResult> AddPromo([FromForm]PromoPost post)
        {
            await _productionService.AddPromo(post);
            return Ok(new { message = "Se agregó correctamente la promoción" });
        }

        [HttpPatch("UpdatePromo")]
        public async Task<IActionResult> UpdatePromo([FromForm]PromoPost post)
        {
            await _productionService.UpdatePromo(post);
            return Ok(new { message = "Se actualizó correctamente la promoción" });
        }

        [HttpDelete("DeletePromo/{id}")]
        public async Task<IActionResult> DeletePromo(int id)
        {
            await _productionService.DeletePromo(id);
            return Ok(new { message = "Se eliminó correctamente la promoción" });
        }

        [HttpGet("GetDeliveryTimes")]
        public async Task<IActionResult> GetDeliveryTimes()
        {
            var times = await _productionService.GetDeliveryTimes();
            return Ok(times);
        }

        [HttpPut("AddDeliveryTime")]
        public async Task<IActionResult> AddDeliveryTime(DeliveryTimesModel time)
        {
            await _productionService.AddDeliveryTime(time);
            return Ok(new { message = "Agregaste un nuevo horario" });
        }

        [HttpPatch("UpdateDeliveryTime")]
        public async Task<IActionResult> UpdateDeliveryTime(DeliveryTimesModel time)
        {
            await _productionService.UpdateDeliveryTime(time);
            return Ok(new { message = "Modificaste el horario" });
        }

        [HttpDelete("DeleteDeliveryTime/{id}")]
        public async Task<IActionResult> DeleteDeliveryTime(int id)
        {
            await _productionService.DeleteDeliveryTime(id);
            return Ok(new { message = "Eliminaste el horario" });
        }
    }
}
