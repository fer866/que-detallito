using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace QueDetallitoAdmin.Entities.Production
{
    public class ProductImagePost
    {
        public int IdProduct { get; set; }
        public int IdVariant { get; set; }
        public IFormFile File { get; set; }
    }
}
