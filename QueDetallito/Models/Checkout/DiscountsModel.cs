using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace QueDetallito.Models.Checkout
{
    public class DiscountsModel
    {
        public int ID { get; set; }
        public string DiscountCode { get; set; }
        public decimal Discount { get; set; }
        public DateTime ValidFrom { get; set; }
        public DateTime ValidTo { get; set; }
        public Nullable<int> IdCustomer { get; set; }
        public bool Active { get; set; }
    }
}
