using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace QueDetallito.Models.Sales
{
    public class ReviewsView
    {
        public int IdProduct { get; set; }
        public string CustomerName { get; set; }
        public byte Stars { get; set; }
        public string Title { get; set; }
        public string Review { get; set; }
        public DateTime Created { get; set; }
    }
}
