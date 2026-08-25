using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace QueDetallito.Models
{
    public class ProductVariantsView
    {
        public int IdProduct { get; set; }
        public int IdVariant { get; set; }
        public string NameVariant { get; set; }
        public byte Stock { get; set; }
        public Nullable<decimal> Price { get; set; }
        public decimal FinalPrice { get; set; }
        public decimal Discount { get; set; }
        public byte NextAvailability { get; set; }
        public bool CustNumber { get; set; }
        public bool CustLetter { get; set; }
        public bool CustMessage { get; set; }
        public Nullable<byte> NoImage { get; set; }
        public string UrlLocation { get; set; }
        public Nullable<int> MessageLength { get; set; }
    }
}
