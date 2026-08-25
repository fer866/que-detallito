using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace QueDetallitoAdmin.Entities.Production
{
    public class CalendarPost
    {
        public int ID { get; set; }
        public DateTime CalDate { get; set; }
        public DateTime StartOfMonth { get; set; }
    }
}
