using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace QueDetallito.Entities.Product
{
    public class Category
    {
        public string CategoryName { get; set; }
        public IEnumerable<ListProducts> Products { get; set; }
    }
}
