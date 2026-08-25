using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace QueDetallito.Entities.Checkout
{
    public class CartItem
    {
        public int IdCustomer { get; set; }
        public int IdProduct { get; set; }
        public string Name { get; set; }
        public int IdVariant { get; set; }
        public byte Quantity { get; set; }
        public decimal Cost { get; set; }
        public decimal Price { get; set; }
        public decimal Discount { get; set; }
        public decimal FinalPrice { get; set; }
        public string SpecialTxt { get; set; }
        public DateTime DeliveryDate { get; set; }
        public int IdDeliveryTime { get; set; }
        public byte NextAvailability { get; set; }
        public bool ProductActive { get; set; }
        public bool VariantActive { get; set; }
    }
}
