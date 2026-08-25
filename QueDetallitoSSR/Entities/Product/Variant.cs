using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace QueDetallito.Entities.Product
{
    public class Variant
    {
        public int IdVariant { get; set; }
        public string NameVariant { get; set; }
        public byte Stock { get; set; }
        public Nullable<decimal> Price { get; set; }
        public decimal FinalPrice { get; set; }
        public Nullable<decimal> Discount { get; set; }
        public byte NextAvailability { get; set; }
        public bool CustNumber { get; set; }
        public bool CustLetter { get; set; }
        public bool CustMessage { get; set; }
        public Nullable<int> MessageLength { get; set; }
        public IEnumerable<ProductImages> Images { get; set; }
    }
}
