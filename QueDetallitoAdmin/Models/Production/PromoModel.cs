using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace QueDetallitoAdmin.Models.Production
{
    public class PromoModel
    {
        public int ID { get; set; }
        public string Name { get; set; }
        public DateTime PromoBegin { get; set; }
        public DateTime PromoExpires { get; set; }
        public string UrlLocation { get; set; }
        public string UrlLocationSm { get; set; }
        public string RouterName { get; set; }
        public string RouterParam { get; set; }
        public string QueryParam { get; set; }
        public bool IsCategory { get; set; }
        public bool IsTemporal { get; set; }
        public bool IsCarousel { get; set; }
    }
}
