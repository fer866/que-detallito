using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace QueDetallitoAdmin.Entities.Production
{
    public class ListProducts
    {
        public int ID { get; set; }
        public string Name { get; set; }
        public int IdCat { get; set; }
        public string CategoryName { get; set; }
        public string ShortDesc { get; set; }
        public string LargeDesc { get; set; }
        public decimal Cost { get; set; }
        public Nullable<decimal> Price { get; set; }
        public decimal FinalPrice { get; set; }
        public decimal Discount { get; set; }
        public string UrlLocation { get; set; }
        public bool Active { get; set; }
        public Nullable<int> IdSeason { get; set; }
        public int VariantsCount { get; set; }
        public int ReviewStars { get; set; }
        public int ReviewsCount { get; set; }
    }
}
