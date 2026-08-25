using Microsoft.AspNetCore.Http;
using QueDetallitoAdmin.Models.Production;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace QueDetallitoAdmin.Entities.Production
{
    public class PromoPost
    {
        public PromoModel Promo { get; set; }
        public IEnumerable<IFormFile> Images { get; set; }
    }
}
