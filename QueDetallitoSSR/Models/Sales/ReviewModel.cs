using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace QueDetallito.Models.Sales
{
    public class ReviewModel
    {
        public int IdOrder { get; set; }
        public int OrderYear { get; set; }
        public int IdCustomer { get; set; }
        public int IdProduct { get; set; }
        public byte Stars { get; set; }
        public string Title { get; set; }
        public string Review { get; set; }
        public DateTime Created { get; set; }
    }
}
