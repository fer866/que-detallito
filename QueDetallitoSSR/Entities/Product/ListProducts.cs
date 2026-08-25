using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace QueDetallito.Entities.Product
{
    public class ListProducts
    {
        public int ID { get; set; }
        public string Name { get; set; }
        public string CategoryName { get; set; }
        public string ShortDesc { get; set; }
        public decimal Price { get; set; }
        public decimal FinalPrice { get; set; }
        public decimal Discount { get; set; }
        public string UrlLocation { get; set; }
        public bool Active { get; set; }
    }
}
