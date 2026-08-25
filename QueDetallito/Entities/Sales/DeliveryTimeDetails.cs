using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace QueDetallito.Entities.Sales
{
    public class DeliveryTimeDetails
    {
        public int ID { get; set; }
        public string Name { get; set; }
        public TimeSpan MaxTime { get; set; }
    }
}
