using QueDetallitoAdmin.Data;
using QueDetallitoAdmin.Models.Production;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Dapper;
using QueDetallitoAdmin.Entities.Production;
using System.IO;
using Microsoft.AspNetCore.Hosting;
using QueDetallitoAdmin.Models.Sales;

namespace QueDetallitoAdmin.Services
{
    public interface IProductionService
    {
        Task<IEnumerable<CatalogModel>> GetCatalogs(Catalog catalog);
        Task AddCatalog(Catalog catalog);
        Task EditCatalog(Catalog catalog);
        Task<IEnumerable<ListProducts>> GetProducts();
        Task AddProduct(ProductModel product);
        Task UpdateProduct(ProductModel product);
        Task DeleteProduct(int idProduct);
        Task<IEnumerable<VariantModel>> GetVariants(int idProduct);
        Task AddVariant(VariantPost post);
        Task UpdateVariant(VariantModel variant);
        Task DeleteVariant(int idVariant);
        Task<IEnumerable<ProductImageModel>> GetProductImages(int idVariant);
        Task AddProductImage(ProductImagePost post);
        Task DeleteProductImage(ProductImageModel productImage);
        Task<IEnumerable<CalendarGroupPost>> GetCalendar(int year);
        Task AddCalendarDay(CalendarModel day);
        Task DeleteCalendarDay(int id);
        Task<IEnumerable<PromoModel>> GetPromos();
        Task AddPromo(PromoPost post);
        Task UpdatePromo(PromoPost post);
        Task DeletePromo(int id);
        Task<IEnumerable<DeliveryTimesModel>> GetDeliveryTimes();
        Task AddDeliveryTime(DeliveryTimesModel time);
        Task UpdateDeliveryTime(DeliveryTimesModel time);
        Task DeleteDeliveryTime(int id);
    }
    public class ProductionService : IProductionService
    {
        private readonly IDatabaseConnection _context;
        private readonly IWebHostEnvironment _env;
        private readonly string _productFolder = "media";
        public ProductionService(IDatabaseConnection context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        public async Task<IEnumerable<CatalogModel>> GetCatalogs(Catalog catalog)
        {
            using var conn = await _context.CreateConnectionAsync();
            var catalogs = await conn.QueryAsync<CatalogModel>($"select * from {catalog.NameDb}");
            return catalogs;
        }

        public async Task AddCatalog(Catalog catalog)
        {
            using var conn = await _context.CreateConnectionAsync();
            catalog.CurrentCatalog.Created = DateTime.Now.LocalTime();

            await conn.ExecuteAsync($"insert into {catalog.NameDb} values (" +
                "@Name, @Created)", catalog.CurrentCatalog);
        }

        public async Task EditCatalog(Catalog catalog)
        {
            using var conn = await _context.CreateConnectionAsync();

            await conn.ExecuteAsync($"update {catalog.NameDb} set " +
                "name = @Name where id = @ID", catalog.CurrentCatalog);
        }

        public async Task<IEnumerable<ListProducts>> GetProducts()
        {
            using var conn = await _context.CreateConnectionAsync();
            var list = await conn.QueryAsync<ListProducts>("select * from Production.ViewListProducts");

            return list;
        }

        public async Task AddProduct(ProductModel product)
        {
            using var conn = await _context.CreateConnectionAsync();
            product.Created = DateTime.Now.LocalTime();
            await conn.ExecuteAsync("insert into Production.Products values (" +
                "@IdCat,@Name,@ShortDesc,@LargeDesc,@Created,@Modified,@Active,@IdSeason)", product);
        }

        public async Task UpdateProduct(ProductModel product)
        {
            using var conn = await _context.CreateConnectionAsync();
            product.Modified = DateTime.Now.LocalTime();

            await conn.ExecuteAsync("update Production.Products set " +
                "idcat = @IdCat, " +
                "name = @Name, " +
                "shortdesc = @ShortDesc, " +
                "largedesc = @LargeDesc, " +
                "modified = @Modified, " +
                "active = @Active, " +
                "idseason = @IdSeason " +
                "where id = @ID", product);
        }

        public async Task DeleteProduct(int idProduct)
        {
            using var conn = await _context.CreateConnectionAsync();
            var param = new { idProduct };
            var idOrder = await conn.QuerySingleOrDefaultAsync<Nullable<int>>("select top 1 idOrder from Sales.OrderProducts where idProduct = @idProduct", param);

            if (idOrder != null)
                throw new AppException("No es posible eliminar el producto, ya que tiene órdenes registradas");

            var variants = await conn.QueryAsync<int>("select idVariant from Production.Variants where idProduct = @idProduct", param);
            variants.ToList().ForEach(async idVariant =>
            {
                await DeleteVariant(idVariant);
            });

            await conn.ExecuteAsync("delete Production.Products where id = @idProduct", param);
        }

        public async Task<IEnumerable<VariantModel>> GetVariants(int idProduct)
        {
            using var conn = await _context.CreateConnectionAsync();
            var param = new { id = idProduct };

            var list = await conn.QueryAsync<VariantModel>("select * from Production.Variants where IdProduct = @id", param);

            return list;
        }

        public async Task AddVariant(VariantPost post)
        {
            using var conn = await _context.CreateConnectionAsync();
            var variant = post.Variant;
            variant.Created = DateTime.Now.LocalTime();

            var idVariant = await conn.QuerySingleOrDefaultAsync<Nullable<int>>("insert into Production.Variants output inserted.IdVariant values (" +
                "@IdProduct,@NameVariant,@Stock,@Cost,@Price,@Discount,@NextAvailability,@CustNumber," +
                "@CustLetter,@CustMessage,@Created,@Modified,@Active,@MessageLength)", variant);

            if (idVariant == null)
                throw new AppException("Ocurrió un error al crear la variante, verifica con el administrador");

            foreach (var item in post.Images)
            {
                await AddProductImage(new ProductImagePost { IdProduct = variant.IdProduct, IdVariant = idVariant.Value, File = item });
            }
        }

        public async Task UpdateVariant(VariantModel variant)
        {
            using var conn = await _context.CreateConnectionAsync();
            variant.Modified = DateTime.Now.LocalTime();

            await conn.ExecuteAsync("update Production.Variants set " +
                "namevariant = @NameVariant," +
                "stock = @Stock," +
                "cost = @Cost," +
                "price = @Price," +
                "discount = @Discount," +
                "nextavailability = @NextAvailability," +
                "custnumber = @CustNumber," +
                "custLetter = @CustLetter," +
                "custmessage = @CustMessage," +
                "modified = @Modified," +
                "active = @Active, " +
                "messageLength = @MessageLength " +
                "where idvariant = @IdVariant", variant);
        }

        public async Task DeleteVariant(int idVariant)
        {
            using var conn = await _context.CreateConnectionAsync();

            //Verifica si existen órdenes creadas anteriormente
            var param = new { idVariant = idVariant };
            var order = await conn.QuerySingleOrDefaultAsync<Nullable<int>>("select top 1 idOrder from Sales.OrderProducts where idVariant = @idVariant", param);

            if (order != null)
                throw new AppException("La variante del producto ya tiene órdenes realizadas, no podrás eliminarla, solo puedes desactivarla.");

            //Elimina todas las imágenes del server y la BD
            await DeleteAllProductImages(idVariant);
            await conn.ExecuteAsync("delete Production.Variants where idVariant = @idVariant", param);
        }

        public async Task<IEnumerable<ProductImageModel>> GetProductImages(int idVariant)
        {
            using var conn = await _context.CreateConnectionAsync();

            var param = new { idVariant = idVariant };
            var images = await conn.QueryAsync<ProductImageModel>("select * from Production.ProductImages where idvariant = @idVariant", param);

            return images;
        }

        public async Task AddProductImage(ProductImagePost post)
        {
            using var conn = await _context.CreateConnectionAsync();

            //Obtiene el último ID de imágen para id de producto y variante
            var noImage = await conn.QuerySingleOrDefaultAsync<byte>("select isnull(max(noImage),0) + 1 from Production.ProductImages " +
                "where idProduct = @idProduct and idVariant = @idVariant", post);
            var productImage = new ProductImageModel
            {
                IdProduct = post.IdProduct,
                IdVariant = post.IdVariant,
                NoImage = noImage,
                Created = DateTime.Now.LocalTime()
            };

            //Guarda el archivo en el servidor
            var productName = await conn.QuerySingleOrDefaultAsync<string>("select top 1 name from Production.ViewProductImageName where idVariant = @Idvariant", productImage);
            
            //Server Path
            string serverPath = Path.Combine(_env.ContentRootPath, @"..\", _productFolder);
            serverPath = Path.GetFullPath(serverPath);
            //Filename
            string fileName = productName + noImage + Path.GetExtension(post.File.FileName);
            //File Path
            string filePath = Path.Combine(serverPath, fileName);
            //Save into server path
            using Stream fs = new FileStream(filePath, FileMode.Create);
            await post.File.CopyToAsync(fs);

            //Guarda registro de la imagen en BD
            productImage.UrlLocation = Path.Combine(_productFolder, fileName);
            await conn.ExecuteAsync("insert into Production.ProductImages values (" +
                "@IdProduct," +
                "@IdVariant," +
                "@NoImage," +
                "@UrlLocation," +
                "@Created)", productImage);
        }

        public async Task DeleteProductImage(ProductImageModel productImage)
        {
            using var conn = await _context.CreateConnectionAsync();

            RemoveImageFromServer(productImage.UrlLocation);
            await conn.ExecuteAsync("delete Production.ProductImages where idProduct = @IdProduct and idVariant = @IdVariant and noImage = @NoImage", productImage);
        }

        private async Task DeleteAllProductImages(int idVariant, int? idProduct = null)
        {
            using var conn = await _context.CreateConnectionAsync();
            var param = new { idVariant = idVariant, idProduct = idProduct };

            if (idProduct != null)
            {
                var prodImages = await conn.QueryAsync<string>("select urlLocation from Production.ProductImages where idProduct = @idProduct", param);
                foreach (var item in prodImages)
                {
                    RemoveImageFromServer(item);
                }
                await conn.ExecuteAsync("delete Production.ProductImages where idProduct = @idProduct", param);
            }
            else
            {
                var varImages = await conn.QueryAsync<string>("select urlLocation from Production.ProductImages where idVariant = @idVariant", param);
                foreach (var item in varImages)
                {
                    RemoveImageFromServer(item);
                }
                await conn.ExecuteAsync("delete Production.ProductImages where idVariant = @idVariant", param);
            }
        }

        private void RemoveImageFromServer(string urlLocation)
        {
            string serverPath = _env.ContentRootPath;
            string filePath = Path.Combine(serverPath, @"..\", urlLocation);
            if (!File.Exists(filePath))
                throw new AppException("Ups, la imagen no se encontró. Verifique con el administrador");
            File.Delete(filePath);
        }

        public async Task<IEnumerable<CalendarGroupPost>> GetCalendar(int year)
        {
            using var conn = await _context.CreateConnectionAsync();
            var param = new { year = year };
            var list = await conn.QueryAsync<CalendarPost>("select ID, CalDate, StartOfMonth from Production.ViewCalendar where CalYear = @year order by CalDate", param);

            var grouped = list.GroupBy(c => c.StartOfMonth, (month, calendars) => new CalendarGroupPost
            {
                GroupDate = month,
                Calendars = calendars
            });

            return grouped;
        }

        public async Task AddCalendarDay(CalendarModel day)
        {
            using var conn = await _context.CreateConnectionAsync();
            day.CalDate = day.CalDate.Date;
            var date = await conn.QuerySingleOrDefaultAsync<Nullable<DateTime>>("select top 1 CalDate from Production.Calendar where CalDate = @CalDate", day);
            if (date != null)
                throw new AppException("Ya está registrado ese día, favor de verificar");
            await conn.ExecuteAsync("insert into Production.Calendar values (@CalDate)", day);
        }

        public async Task DeleteCalendarDay(int id)
        {
            using var conn = await _context.CreateConnectionAsync();
            var param = new { id = id };
            await conn.ExecuteAsync("delete Production.Calendar where ID = @id", param);
        }

        public async Task<IEnumerable<PromoModel>> GetPromos()
        {
            using var conn = await _context.CreateConnectionAsync();
            var list = await conn.QueryAsync<PromoModel>("select * from Production.Promos");

            return list;
        }

        public async Task AddPromo(PromoPost post)
        {
            using var conn = await _context.CreateConnectionAsync();

            //Guarda imágenes en el servidor
            var promosSaved = await SavePromoImages(post);
            post.Promo.UrlLocation = promosSaved.Item1;
            post.Promo.UrlLocationSm = promosSaved.Item2;
            post.Promo.PromoBegin = post.Promo.PromoBegin.Date;
            post.Promo.PromoExpires = post.Promo.PromoExpires.Date;

            //Guarda el registro en BD
            await conn.ExecuteAsync("insert into Production.Promos values (" +
                "@Name, " +
                "@PromoBegin, " +
                "@PromoExpires, " +
                "@UrlLocation, " +
                "@UrlLocationSm, " +
                "@RouterName, " +
                "@RouterParam, " +
                "@QueryParam, " +
                "@IsCategory, " +
                "@IsTemporal, " +
                "@IsCarousel)", post.Promo);
        }

        private async Task<(string, string)> SavePromoImages(PromoPost post)
        {
            string promo1 = string.Empty;
            string promoSm = string.Empty;

            var file1 = post.Images.ElementAt(0);
            var file2 = post.Images.ElementAt(1);

            //Server Path
            string serverPath = Path.Combine(_env.ContentRootPath, @"..\", _productFolder);
            serverPath = Path.GetFullPath(serverPath);

            //Filename
            var today = DateTime.Now.LocalTime();
            var todayName = $"{today.Second}{today.Minute}{today:ddMMyy}";
            string fileName = post.Promo.Name + $"_{todayName}" + Path.GetExtension(file1.FileName);
            //File Path
            string filePath = Path.Combine(serverPath, fileName);
            //Save into server path
            using Stream fs = new FileStream(filePath, FileMode.Create);
            await file1.CopyToAsync(fs);
            //Guarda registro de la imagen en BD
            promo1 = Path.Combine(_productFolder, fileName);

            //Guarda la 2da imagen en menor tamaño para móviles
            fileName = post.Promo.Name + $"_{todayName}_sm" + Path.GetExtension(file2.FileName);
            filePath = Path.Combine(serverPath, fileName);
            using Stream fileS = new FileStream(filePath, FileMode.Create);
            await file2.CopyToAsync(fileS);
            promoSm = Path.Combine(_productFolder, fileName);

            return (promo1, promoSm);
        }

        public async Task UpdatePromo(PromoPost post)
        {
            using var conn = await _context.CreateConnectionAsync();

            var param = new { id = post.Promo.ID };
            var promo = await conn.QuerySingleOrDefaultAsync<PromoModel>("select top 1 * from Production.Promos where id = @id", param);
            if (post.Images != null)
            {
                RemoveImageFromServer(promo.UrlLocation);
                RemoveImageFromServer(promo.UrlLocationSm);
                var promosSaved = await SavePromoImages(post);
                post.Promo.UrlLocation = promosSaved.Item1;
                post.Promo.UrlLocationSm = promosSaved.Item2;
            }
            else
            {
                post.Promo.UrlLocation = promo.UrlLocation;
                post.Promo.UrlLocationSm = promo.UrlLocationSm;
            }
            post.Promo.PromoBegin = post.Promo.PromoBegin.Date;
            post.Promo.PromoExpires = post.Promo.PromoExpires.Date;

            await conn.ExecuteAsync("update Production.Promos set " +
                "name = @Name, " +
                "promoBegin = @PromoBegin, " +
                "promoExpires = @PromoExpires, " +
                "urlLocation = @UrlLocation, " +
                "urlLocationSm = @UrlLocationSm, " +
                "routerName = @RouterName, " +
                "routerParam = @RouterParam, " +
                "queryParam = @QueryParam, " +
                "isCategory = @IsCategory, " +
                "isTemporal = @IsTemporal, " +
                "isCarousel = @IsCarousel " +
                "where id = @ID", post.Promo);
        }

        public async Task DeletePromo(int id)
        {
            using var conn = await _context.CreateConnectionAsync();

            var param = new { id = id };
            var promo = await conn.QuerySingleOrDefaultAsync<PromoModel>("select top 1 * from Production.Promos where id = @id", param);

            RemoveImageFromServer(promo.UrlLocation);
            RemoveImageFromServer(promo.UrlLocationSm);

            await conn.ExecuteAsync("delete Production.Promos where id = @id", param);
        }

        public async Task<IEnumerable<DeliveryTimesModel>> GetDeliveryTimes()
        {
            using var conn = await _context.CreateConnectionAsync();
            var times = await conn.QueryAsync<DeliveryTimesModel>("select * from Sales.DeliveryTimes");

            return times;
        }

        public async Task AddDeliveryTime(DeliveryTimesModel time)
        {
            using var conn = await _context.CreateConnectionAsync();

            time.Created = DateTime.Now.LocalTime();
            await conn.ExecuteAsync("insert into Sales.DeliveryTimes values (" +
                "@Name, @StartTime, @EndTime, @Saturday, @Sunday, @MaxTime, @Created, @Active)", time);
        }

        public async Task UpdateDeliveryTime(DeliveryTimesModel time)
        {
            using var conn = await _context.CreateConnectionAsync();

            await conn.ExecuteAsync("update Sales.DeliveryTimes set " +
                "name = @Name, " +
                "startTime = @StartTime, " +
                "endTime = @EndTime, " +
                "saturday = @Saturday, " +
                "sunday = @Sunday, " +
                "maxTime = @MaxTime, " +
                "active = @Active " +
                "where id = @ID", time);
        }

        public async Task DeleteDeliveryTime(int id)
        {
            using var conn = await _context.CreateConnectionAsync();

            var cart = await conn.QuerySingleOrDefaultAsync<Nullable<int>>("select top 1 idCustomer from Sales.Cart where idDeliveryTime = @id", new { id });
            if (cart != null)
                throw new AppException("No es posible eliminar el horario, ya que tiene productos en carrito", persist: true);
            var order = await conn.QuerySingleOrDefaultAsync<Nullable<int>>("select top 1 id from Sales.Orders where idDeliveryTime = @id", new { id });
            if (order != null)
                throw new AppException("No es posible eliminar el horario, ya que tiene órdenes", persist: true);

            await conn.ExecuteAsync("delete Sales.DeliveryTimes where id = @id", new { id });
        }
    }
}
