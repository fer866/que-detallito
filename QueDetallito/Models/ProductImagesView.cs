using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;

namespace QueDetallito.Models
{
    public class ProductImagesView
    {
        public int IdProduct { get; set; }
        public int IdVariant { get; set; }
        public byte NoImage { get; set; }
        public string UrlLocation { get; set; }
    }
}
