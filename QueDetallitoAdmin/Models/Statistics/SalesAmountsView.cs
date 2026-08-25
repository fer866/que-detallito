using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace QueDetallitoAdmin.Models.Statistics
{
    public class SalesAmountsView
    {
        public int IdOrder { get; set; }
        public DateTime Created { get; set; }
        public int IdStatus { get; set; }
        public decimal GrossAmount { get; set; }
        public decimal NetAmount { get; set; }
    }
}
