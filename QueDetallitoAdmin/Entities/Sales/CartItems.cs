using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace QueDetallitoAdmin.Entities.Sales
{
    public class CartItems
    {
        public int IdCustomer { get; set; }
        public int ID { get; set; }
        public string CategoryName { get; set; }
        public string Name { get; set; }
        public int IdVariant { get; set; }
        public string NameVariant { get; set; }
        public byte Stock { get; set; }
        public byte Quantity { get; set; }
        public DateTime DeliveryDate { get; set; }
        public string SpecialTxt { get; set; }
    }
}
