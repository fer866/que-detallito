using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace QueDetallitoAdmin.Entities.Statistics
{
    public class StatisticSales
    {
        public string Description { get; set; }
        public decimal NetAmount { get; set; }
        public decimal GrossAmount { get; set; }
        public int Count { get; set; }
    }
}
