using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace QueDetallitoAdmin.Models.Production
{
    public class ProductModel
    {
        public int ID { get; set; }
        public int IdCat { get; set; }
        public string Name { get; set; }
        public string ShortDesc { get; set; }
        public string LargeDesc { get; set; }
        public DateTime Created { get; set; }
        public Nullable<DateTime> Modified { get; set; }
        public bool Active { get; set; }
        public Nullable<int> IdSeason { get; set; }
    }
}
