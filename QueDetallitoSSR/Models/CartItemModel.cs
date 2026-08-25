using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace QueDetallito.Models
{
    public class CartItemModel
    {
        public int IdCustomer { get; set; }
        public int IdProduct { get; set; }
        public int IdVariant { get; set; }
        public byte Quantity { get; set; }
        public DateTime DeliveryDate { get; set; }
        public int IdDeliveryTime { get; set; }
        public string SpecialTxt { get; set; }
        public DateTime Created { get; set; }
    }
}
