using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace QueDetallito.Entities.Checkout
{
    public class OrderPost
    {
        public int IdCustomer { get; set; }
        public int IdDelivery { get; set; }
        public int IdStatus { get; set; }
        public int IdPaymentMethod { get; set; }
        public Nullable<int> IdDiscount { get; set; }
        public string PaymentDetails { get; set; }
        public string PaymentMethodDetails { get; set; }
        public string Font { get; set; }
        public string Note { get; set; }
        public string Sender { get; set; }
        public string MethodId { get; set; }
        public string IntentId { get; set; }
        public string OrderId { get; set; }
    }
}
