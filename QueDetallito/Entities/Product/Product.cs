using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace QueDetallito.Entities.Product
{
    public class Product
    {
        public int ID { get; set; }
        public string CategoryName { get; set; }
        public string Name { get; set; }
        public string ShortDesc { get; set; }
        public string LargeDesc { get; set; }
        public int ReviewStars { get; set; }
        public int ReviewsCount { get; set; }
        public IEnumerable<Variant> Variants { get; set; }
    }
}
