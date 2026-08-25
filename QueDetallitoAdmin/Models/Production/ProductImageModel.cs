using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace QueDetallitoAdmin.Models.Production
{
    public class ProductImageModel
    {
        public int IdProduct { get; set; }
        public int IdVariant { get; set; }
        public byte NoImage { get; set; }
        public string UrlLocation { get; set; }
        public DateTime Created { get; set; }
    }
}
