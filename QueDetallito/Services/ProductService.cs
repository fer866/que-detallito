using QueDetallito.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Dapper;
using QueDetallito.Models;
using QueDetallito.Handlers;
using QueDetallito.Entities.Product;
using QueDetallito.Entities.Sales;
using QueDetallito.Models.Sales;

namespace QueDetallito.Services
{
    public interface IProductService
    {
        Task<IEnumerable<Category>> GetProducts();
        Task<IEnumerable<PromosView>> GetPromos();
        Task<IEnumerable<PromosView>> GetSeasonPromos();
        Task<Product> GetProduct(int id);
        Task<IEnumerable<DateTime>> GetHolidays();
        Task<IEnumerable<DeliveryTime>> GetDeliveryTimes(DateTime date);
        Task<IEnumerable<ListProducts>> GetWishProducts(int id, int[] idProducts = null);
        Task<IEnumerable<ListProducts>> GetWishProductsAnonym(int[] idProducts);
        Task AddWishProduct(int id, int idProduct);
        Task DeleteWishProduct(int id, int idProduct);
        Task<IEnumerable<Cart>> GetCartItems(int id, IEnumerable<CartItemModel> items = null);
        Task<IEnumerable<Cart>> GetCartItemsAnonym(IEnumerable<CartItemModel> items);
        Task AddCartItem(int id, CartItemModel cart);
        Task ChangeCartDateTime(CartDateTime cart);
        Task DeleteCartItem(int id, int idProduct, int idVariant);
        Task<IEnumerable<ListProducts>> SearchProducts(string term);
        Task<CartVerification> VerifyCartDateTime(CartItemModel cart);
        Task AddReview(ReviewModel review);
        Task<IEnumerable<ReviewsView>> GetProductReviews(int idProduct);
    }
    public class ProductService : IProductService
    {
        private readonly IDatabaseConnection _context;
        public ProductService(IDatabaseConnection context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Category>> GetProducts()
        {
            using var conn = await _context.CreateConnectionAsync();
            var myPro = conn.Query<ListProductsView>("select * from Market.ViewListProducts").Select(p => new ListProducts
            {
                ID = p.ID,
                CategoryName = p.CategoryName,
                Name = p.Name,
                ShortDesc = p.ShortDesc,
                Price = p.Price,
                FinalPrice = p.FinalPrice,
                Discount = p.Discount,
                UrlLocation = p.UrlLocation,
                Active = p.Active

            }).GroupBy(c => c.CategoryName, (cat, products) => new Category
            {
                CategoryName = cat,
                Products = products
            });

            return myPro;
        }

        public async Task<IEnumerable<PromosView>> GetPromos()
        {
            using var conn = await _context.CreateConnectionAsync();
            var param = new { carousel = true, today = DateTime.Now.LocalTime() };
            var promos = await conn.QueryAsync<PromosView>("select * from Production.Promos where " +
                "isCarousel = @carousel and @today between promobegin and promoexpires", param);

            return promos;
        }

        public async Task<IEnumerable<PromosView>> GetSeasonPromos()
        {
            using var conn = await _context.CreateConnectionAsync();
            var param = new { category = true, temporal = true, today = DateTime.Now.LocalTime() };
            var season = await conn.QueryAsync<PromosView>("select * from Production.Promos where " +
                "(isCategory = @category or isTemporal = @temporal) and @today between promobegin and promoexpires", param);

            return season;
        }

        public async Task<Product> GetProduct(int id)
        {
            using var conn = await _context.CreateConnectionAsync();

            var parameters = new { id = id };
            var myProduct = await conn.QuerySingleOrDefaultAsync<ProductView>("select top 1 * from Market.ViewProduct where id = @id", parameters);
            if (myProduct == null)
                throw new AppException("Vaya al parecer el producto no existe, favor de intentar más tarde");

            var variants = conn.QueryAsync<ProductVariantsView>("select * from Market.ViewProductVariants where idProduct = @id", parameters)
                .Result.GroupBy(g => g.IdVariant, (variant, opts) => new Variant
                {
                    IdVariant = variant,
                    NameVariant = opts.First().NameVariant,
                    Price = opts.First().Price,
                    FinalPrice = opts.First().FinalPrice,
                    Discount = opts.First().Discount,
                    Stock = opts.First().Stock,
                    NextAvailability = opts.First().NextAvailability,
                    CustNumber = opts.First().CustNumber,
                    CustLetter = opts.First().CustLetter,
                    CustMessage = opts.First().CustMessage,
                    MessageLength = opts.FirstOrDefault(m => m.IdVariant == variant).MessageLength,
                    Images = opts.Where(i => i.IdVariant == variant).Select(im => new ProductImages { NoImage = im.NoImage.GetValueOrDefault(), UrlLocation = im.UrlLocation })
                });

            var product = new Product
            {
                ID = myProduct.ID,
                CategoryName = myProduct.CategoryName,
                Name = myProduct.Name,
                ShortDesc = myProduct.ShortDesc,
                LargeDesc = myProduct.LargeDesc,
                ReviewStars = myProduct.ReviewStars,
                ReviewsCount = myProduct.ReviewsCount,
                Variants = variants
            };

            return product;
        }

        public async Task<IEnumerable<DateTime>> GetHolidays()
        {
            using var conn = await _context.CreateConnectionAsync();

            var param = new { date = DateTime.Now.LocalTime() };
            var dates = await conn.QueryAsync<DateTime>("select CalDate from Production.Calendar where caldate >= @date", param);

            return dates;
        }

        public async Task<IEnumerable<DeliveryTime>> GetDeliveryTimes(DateTime date)
        {
            using var conn = await _context.CreateConnectionAsync();
            var today = DateTime.Now.LocalTime();
            var diff = (date.Date - today.Date).TotalDays;
            IEnumerable<DeliveryTime> times = new List<DeliveryTime>();

            if (diff == 1)
            {
                times = await conn.QueryAsync<DeliveryTime>("select * from Sales.DeliveryTimes " +
                    "where saturday = @sat and sunday = @sun and maxTime > @max and active = @active",
                    new
                    {
                        sat = date.DayOfWeek == DayOfWeek.Saturday,
                        sun = date.DayOfWeek == DayOfWeek.Sunday,
                        max = new TimeSpan(today.TimeOfDay.Hours, today.TimeOfDay.Minutes, today.TimeOfDay.Seconds),
                        active = true
                    });
            }
            else
            {
                times = await conn.QueryAsync<DeliveryTime>("select * from Sales.DeliveryTimes " +
                    "where saturday = @saturday and sunday = @sunday and active = @active", 
                    new { saturday = date.DayOfWeek == DayOfWeek.Saturday, sunday = date.DayOfWeek == DayOfWeek.Sunday, active = true });
            }

            return times;
        }

        public async Task<IEnumerable<ListProducts>> GetWishProducts(int id, int[] idProducts = null)
        {
            using var conn = await _context.CreateConnectionAsync();
            var param = new { id = id };
            var wishIdsCustomer = await conn.QueryAsync<int>("select ID from Market.ViewWishProducts where IdCustomer = @id", param);

            if (idProducts != null && idProducts.Length > 0)
            {
                IEnumerable<int> pending = idProducts.Except(wishIdsCustomer);
                if (pending != null && pending.Any())
                {
                    var insertParam = new { id, idProducts = pending, today = DateTime.Now.LocalTime() };
                    await conn.ExecuteAsync("insert into Sales.WishProducts values (@id, @idProducts, @today)", insertParam);
                }
            }
            IEnumerable<int> ids = wishIdsCustomer.Union(idProducts);

            var idsParam = new { ids };
            var listProducts = await conn.QueryAsync<ListProductsView>("select * from Market.ViewListProducts where ID in @ids", idsParam);
            var wishProducts = listProducts.Select(p => new ListProducts
            {
                ID = p.ID,
                CategoryName = p.CategoryName,
                Name = p.Name,
                ShortDesc = p.ShortDesc,
                Price = p.Price,
                FinalPrice = p.FinalPrice,
                Discount = p.Discount,
                UrlLocation = p.UrlLocation,
                Active = p.Active
            });

            return wishProducts;
        }

        public async Task<IEnumerable<ListProducts>> GetWishProductsAnonym(int[] idProducts)
        {
            using var conn = await _context.CreateConnectionAsync();
            var param = new { id = idProducts };
            var listProducts = await conn.QueryAsync<ListProductsView>("select * from Market.ViewListProducts where ID in @id", param);
            var wishProducts = listProducts.Select(p => new ListProducts
            {
                ID = p.ID,
                CategoryName = p.CategoryName,
                Name = p.Name,
                ShortDesc = p.ShortDesc,
                Price = p.Price,
                FinalPrice = p.FinalPrice,
                Discount = p.Discount,
                UrlLocation = p.UrlLocation,
                Active = p.Active
            });

            return wishProducts;
        }

        public async Task AddWishProduct(int id, int idProduct)
        {
            using var conn = await _context.CreateConnectionAsync();
            var param = new { id = id, idProduct = idProduct, today = DateTime.Now.LocalTime() };

            try
            {
                await conn.ExecuteAsync("insert into Sales.WishProducts values (@id, @idProduct, @today)", param);
            }
            catch (Exception)
            {
                throw new AppException("Ocurrió un problema, porfavor intenta más tarde");
            }
        }

        public async Task DeleteWishProduct(int id, int idProduct)
        {
            using var conn = await _context.CreateConnectionAsync();
            var param = new { id = id, idProduct = idProduct };
            try
            {
                await conn.ExecuteAsync("delete Sales.WishProducts where IdCustomer = @id and IdProduct = @idProduct", param);
            }
            catch (Exception)
            {
                throw new AppException("Ocurrió un problema, porfavor intenta más tarde");
            }
        }

        public async Task<IEnumerable<Cart>> GetCartItems(int id, IEnumerable<CartItemModel> items = null)
        {
            using var conn = await _context.CreateConnectionAsync();
            var param = new { id };
            var cartItems = await conn.QueryAsync<CartItemModel>("select * from Sales.Cart where idCustomer = @id", param);
            
            if (items != null && items.Any())
            {
                var exceptItems = items.Select(i => new { i.IdProduct, i.IdVariant }).Except(cartItems.Select(c => new { c.IdProduct, c.IdVariant }));
                if (exceptItems != null && exceptItems.Any())
                {
                    var anyItems = items.Where(i => exceptItems.Any(e => e.IdProduct == i.IdProduct && e.IdVariant == i.IdVariant));
                    if (anyItems != null && anyItems.Any())
                    {
                        var insertItems = anyItems.Select(a => new CartItemModel
                        {
                            IdCustomer = id,
                            IdProduct = a.IdProduct,
                            IdVariant = a.IdVariant,
                            Quantity = a.Quantity,
                            DeliveryDate = a.DeliveryDate,
                            IdDeliveryTime = a.IdDeliveryTime,
                            SpecialTxt = a.SpecialTxt,
                            Created = DateTime.Now.LocalTime()
                        });
                        await conn.ExecuteAsync("insert into Sales.Cart values " +
                            "(@IdCustomer,@IdProduct,@IdVariant,@Quantity,@DeliveryDate,@IdDeliveryTime,@SpecialTxt,@Created)", insertItems);
                    }
                }
            }

            var unionItems = items.Select(i => new { i.IdProduct, i.IdVariant }).Union(cartItems.Select(c => new { c.IdProduct, c.IdVariant }));
            var selParam = new { id, idProduct = unionItems.Select(p => p.IdProduct), idVariant = unionItems.Select(v => v.IdVariant) };
            IEnumerable<Cart> cart = null;
            try
            {
                cart = await conn.QueryAsync<Cart>("select * from Market.ViewCart where idCustomer = @id and id in @idProduct and idVariant in @idVariant", selParam);
            }
            catch (Exception e)
            {
                throw new AppException(e.Message);
            }

            return cart;
        }

        public async Task<IEnumerable<Cart>> GetCartItemsAnonym(IEnumerable<CartItemModel> items)
        {
            using var conn = await _context.CreateConnectionAsync();

            var param = new { idProduct = items.Select(i => i.IdProduct), idVariant = items.Select(i => i.IdVariant) };
            var cartItems = await conn.QueryAsync<Cart>("select * from Market.ViewCartAnonym where id in @idProduct and idVariant in @idVariant", param);
            var idDeliveryTime = items.FirstOrDefault().IdDeliveryTime;
            var timeName = await conn.QuerySingleOrDefaultAsync<string>("select top 1 name from Sales.DeliveryTimes where id = @idDeliveryTime",
                new { idDeliveryTime });
            
            var cItems = cartItems.Select(c => new Cart
            {
                ID = c.ID,
                CategoryName = c.CategoryName,
                Name = c.Name,
                IdVariant = c.IdVariant,
                NameVariant = c.NameVariant,
                Stock = c.Stock,
                Quantity = items.FirstOrDefault(i => i.IdProduct == c.ID && i.IdVariant == c.IdVariant).Quantity,
                Price = c.Price,
                FinalPrice = c.FinalPrice,
                Discount = c.Discount,
                NextAvailability = c.NextAvailability,
                DeliveryDate = items.FirstOrDefault().DeliveryDate,
                IdDeliveryTime = idDeliveryTime,
                DeliveryTime = timeName,
                SpecialTxt = items.FirstOrDefault(i => i.IdProduct == c.ID && i.IdVariant == c.IdVariant).SpecialTxt,
                UrlLocation = c.UrlLocation
            });

            return cItems;
        }

        public async Task AddCartItem(int id, CartItemModel cart)
        {
            using var conn = await _context.CreateConnectionAsync();

            var existParam = new { id = id, idProduct = cart.IdProduct, idVariant = cart.IdVariant };
            var exists = await conn.QuerySingleOrDefaultAsync<CartItemModel>("select top 1 * from Sales.Cart where idCustomer = @id and " +
                "idProduct = @idProduct and idVariant = @idVariant", existParam);

            if (exists != null)
            {
                exists.Quantity += cart.Quantity;
                if (exists.SpecialTxt != null)
                {
                    exists.SpecialTxt += $"+{cart.SpecialTxt}";
                }
                exists.DeliveryDate = cart.DeliveryDate;
                exists.IdDeliveryTime = cart.IdDeliveryTime;
                exists.Created = DateTime.Now.LocalTime();
                await conn.ExecuteAsync("update Sales.Cart set " +
                    "quantity = @Quantity," +
                    "specialTxt = @SpecialTxt," +
                    "deliveryDate = @DeliveryDate," +
                    "idDeliveryTime = @IdDeliveryTime," +
                    "created = @Created " +
                    "where idCustomer = @IdCustomer and idProduct = @IdProduct and idVariant = @IdVariant", exists);
            }
            else
            {
                var cartTop = await conn.QuerySingleOrDefaultAsync<CartItemModel>("select top 1 * from Sales.Cart where idCustomer = @id", new { id });
                if (cartTop != null)
                {
                    if (cartTop.DeliveryDate.Date > cart.DeliveryDate.Date)
                    {
                        cart.DeliveryDate = cartTop.DeliveryDate;
                        cart.IdDeliveryTime = cartTop.IdDeliveryTime;
                    }
                    else
                    {
                        await conn.ExecuteAsync("update Sales.Cart set deliveryDate = @date, idDeliveryTime = @time where idCustomer = @id",
                            new { date = cart.DeliveryDate, time = cart.IdDeliveryTime, id });
                    }
                }

                var param = new
                {
                    id,
                    cart.IdProduct,
                    cart.IdVariant,
                    cart.Quantity,
                    cart.DeliveryDate,
                    cart.IdDeliveryTime,
                    cart.SpecialTxt,
                    today = DateTime.Now.LocalTime()
                };
                try
                {
                    await conn.ExecuteAsync("insert into Sales.Cart values (@id,@IdProduct,@IdVariant,@Quantity,@DeliveryDate,@IdDeliveryTime,@SpecialTxt,@today)", param);
                }
                catch (Exception e)
                {
                    throw new AppException(e.Message);
                }
            }
        }

        public async Task ChangeCartDateTime(CartDateTime cart)
        {
            using var conn = await _context.CreateConnectionAsync();

            await conn.ExecuteAsync("update Sales.Cart set " +
                "deliveryDate = @DeliveryDate," +
                "idDeliveryTime = @IdDeliveryTime " +
                "where idCustomer = @IdCustomer", cart);
        }

        public async Task DeleteCartItem(int id, int idProduct, int idVariant)
        {
            using var conn = await _context.CreateConnectionAsync();

            var param = new { id, idProduct, idVariant };
            await conn.ExecuteAsync("delete Sales.Cart where idCustomer = @id and idProduct = @idProduct and idVariant = @idVariant", param);
        }

        public async Task<IEnumerable<ListProducts>> SearchProducts(string term)
        {
            using var conn = await _context.CreateConnectionAsync();

            term = $"%{term.Replace(" ", "%")}%";
            var products = await conn.QueryAsync<ListProducts>("select top 15 * from Market.ViewListProducts " +
                "where name like @term COLLATE Latin1_general_CI_AI or shortDesc like @term COLLATE Latin1_general_CI_AI", new { term });

            return products;
        }

        public async Task<CartVerification> VerifyCartDateTime(CartItemModel cart)
        {
            using var conn = await _context.CreateConnectionAsync();

            var today = DateTime.Now.LocalTime();
            var diff = (cart.DeliveryDate.Date - today.Date).TotalDays;
            var time = await conn.QuerySingleOrDefaultAsync<DeliveryTimeDetails>("select top 1 * from Sales.DeliveryTimes where id = @idDeliveryTime",
                new { cart.IdDeliveryTime });

            var verification = new CartVerification();
            verification.IsValid = true;
            if (diff == 1)
            {
                var timeDay = new TimeSpan(today.TimeOfDay.Hours, today.TimeOfDay.Minutes, today.TimeOfDay.Seconds);
                if (timeDay > time.MaxTime)
                    throw new AppException("La hora ya no es válida, selecciona un nuevo horario de entrega", true);
                else
                {
                    var minutesLeft = time.MaxTime.TotalMinutes - timeDay.TotalMinutes;
                    if (minutesLeft <= 59)
                        verification.MinutesLeft = Convert.ToInt32(Math.Floor(minutesLeft));
                }
            }
            else if (diff <= 0)
                throw new AppException("La hora ya no es válida, selecciona un nuevo horario de entrega", true);

            return verification;
        }

        public async Task AddReview(ReviewModel review)
        {
            using var conn = await _context.CreateConnectionAsync();

            await conn.ExecuteAsync("update Sales.OrderProducts set " +
                "review = @review " +
                "where idOrder = @IdOrder and orderYear = @orderYear and idProduct = @idProduct",
                new { review.IdOrder, review.OrderYear, review.IdProduct, review = true });

            review.Created = DateTime.Now.LocalTime();
            await conn.ExecuteAsync("insert into Sales.Reviews values (" +
                "@IdCustomer, @IdProduct, @Stars, @Title, @Review, @Created)", review);
        }

        public async Task<IEnumerable<ReviewsView>> GetProductReviews(int idProduct)
        {
            using var conn = await _context.CreateConnectionAsync();

            var reviews = await conn.QueryAsync<ReviewsView>("select * from Market.ViewReviews where idProduct = @idProduct", new { idProduct });
            return reviews;
        }
    }
}
