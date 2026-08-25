using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace QueDetallito.Models
{
    public class PromosView
    {
        public byte ID { get; set; }
        public string Name { get; set; }
        public string RouterName { get; set; }
        public string RouterParam { get; set; }
        public string QueryParam { get; set; }
        public string UrlLocation { get; set; }
        public string UrlLocationSm { get; set; }
        public bool IsCategory { get; set; }
        public bool IsTemporal { get; set; }
        public bool IsCarousel { get; set; }
    }
}
