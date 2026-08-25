using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace QueDetallito.Entities.Product
{
    public class Cart
    {
        public int ID { get; set; }
        public string CategoryName { get; set; }
        public string Name { get; set; }
        public byte IdVariant { get; set; }
        public string NameVariant { get; set; }
        public byte Stock { get; set; }
        public byte Quantity { get; set; }
        public decimal Price { get; set; }
        public decimal FinalPrice { get; set; }
        public decimal Discount { get; set; }
        public byte NextAvailability { get; set; }
        public DateTime DeliveryDate { get; set; }
        public int IdDeliveryTime { get; set; }
        public string DeliveryTime { get; set; }
        public string SpecialTxt { get; set; }
        public string UrlLocation { get; set; }
    }
}
