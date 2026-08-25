using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace QueDetallito.Entities.Checkout
{
    public class CheckoutDiscount
    {
        public int ID { get; set; }
        public string DiscountCode { get; set; }
        public decimal Discount { get; set; }
    }
}
