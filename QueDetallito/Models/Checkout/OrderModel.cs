using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace QueDetallito.Models.Checkout
{
    public class OrderModel
    {
        public int ID { get; set; }
        public int OrderYear { get; set; }
        public int IdCustomer { get; set; }
        public Nullable<int> IdDelivery { get; set; }
        public int IdStatus { get; set; }
        public Nullable<int> IdPaymentMethod { get; set; }
        public Nullable<int> IdDiscount { get; set; }
        public int IdDeliveryTime { get; set; }
        public decimal DeliveryCost { get; set; }
        public DateTime DeliveryDate { get; set; }
        public string Font { get; set; }
        public string Note { get; set; }
        public string Sender { get; set; }
        public string PaymentDetails { get; set; }
        public string PaymentMethodDetails { get; set; }
        public DateTime Created { get; set; }
        public Nullable<DateTime> Modified { get; set; }
        public string Remark { get; set; }
        public string PaymentCancelation { get; set; }
    }
}
