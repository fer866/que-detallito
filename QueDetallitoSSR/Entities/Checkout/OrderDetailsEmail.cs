using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace QueDetallito.Entities.Checkout
{
    public class OrderDetailsEmail
    {
        public int IdOrder { get; set; }
        public int OrderYear { get; set; }
        public string PaymentMethod { get; set; }
        public string DeliveryTime { get; set; }
        public string Email { get; set; }
        public string NameDelivery { get; set; }
        public string ZipCode { get; set; }
        public string Street { get; set; }
        public string Number { get; set; }
        public string Suburb { get; set; }
        public string Town { get; set; }
        public string State { get; set; }
        public string Phone { get; set; }
        public Nullable<decimal> Discount { get; set; }
    }
}
