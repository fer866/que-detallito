using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace QueDetallitoAdmin.Entities.Sales
{
    public class OrderProduct
    {
        public int IdOrder { get; set; }
        public int OrderYear { get; set; }
        public int IdProduct { get; set; }
        public string Name { get; set; }
        public string CategoryName { get; set; }
        public int IdVariant { get; set; }
        public string NameVariant { get; set; }
        public string UrlLocation { get; set; }
        public byte Quantity { get; set; }
        public decimal Cost { get; set; }
        public decimal Price { get; set; }
        public decimal Discount { get; set; }
        public decimal FinalPrice { get; set; }
        public string SpecialTxt { get; set; }
    }
}
