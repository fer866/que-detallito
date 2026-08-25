using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace QueDetallitoAdmin.Entities.Sales
{
    public class OrderPost
    {
        public int ID { get; set; }
        public int OrderYear { get; set; }
        public int IdCustomer { get; set; }
        public string CustomerName { get; set; }
        public string CustomerEmail { get; set; }
        public string CustomerPhone { get; set; }
        public int IdDelivery { get; set; }
        public string DeliveryAddress { get; set; }
        public string NameDelivery { get; set; }
        public string DeliveryPhone { get; set; }
        public string Street { get; set; }
        public string DeliveryNumber { get; set; }
        public string Suburb { get; set; }
        public string Town { get; set; }
        public string DeliveryState { get; set; }
        public string ZipCode { get; set; }
        public string SpecialAddress { get; set; }
        public Nullable<decimal> Latitude { get; set; }
        public Nullable<decimal> Longitude { get; set; }
        public int IdStatus { get; set; }
        public string OrderStatus { get; set; }
        public string PaymentMethod { get; set; }
        public string PaymentMethodDetails { get; set; }
        public DateTime DeliveryDate { get; set; }
        public string DeliveryTime { get; set; }
        public string Note { get; set; }
        public string Font { get; set; }
        public string Sender { get; set; }
        public Nullable<decimal> Discount { get; set; }
        public string DiscountCode { get; set; }
        public decimal DeliveryCost { get; set; }
        public Nullable<decimal> TotalCost { get; set; }
        public Nullable<decimal> TotalPrice { get; set; }
        public int TotalProducts { get; set; }
        public string PaymentDetails { get; set; }
        public DateTime Created { get; set; }
        public Nullable<DateTime> Modified { get; set; }
        public string Remark { get; set; }
    }
}
