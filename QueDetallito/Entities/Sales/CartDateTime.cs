using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace QueDetallito.Entities.Sales
{
    public class CartDateTime
    {
        public int IdCustomer { get; set; }
        public DateTime DeliveryDate { get; set; }
        public int IdDeliveryTime { get; set; }
    }
}
