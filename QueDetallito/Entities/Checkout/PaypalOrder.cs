using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace QueDetallito.Entities.Checkout
{
    public class PaypalOrder
    {
        public string OrderID { get; set; }
        public string Status { get; set; }
        public string PayerName { get; set; }
    }
}
