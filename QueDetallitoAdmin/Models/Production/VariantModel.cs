using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace QueDetallitoAdmin.Models.Production
{
    public class VariantModel
    {
        public int IdVariant { get; set; }
        public int IdProduct { get; set; }
        public string NameVariant { get; set; }
        public byte Stock { get; set; }
        public decimal Cost { get; set; }
        public decimal Price { get; set; }
        public decimal Discount { get; set; }
        public byte NextAvailability { get; set; }
        public bool CustNumber { get; set; }
        public bool CustLetter { get; set; }
        public bool CustMessage { get; set; }
        public DateTime Created { get; set; }
        public Nullable<DateTime> Modified { get; set; }
        public bool Active { get; set; }
        public Nullable<int> MessageLength { get; set; }
    }
}
