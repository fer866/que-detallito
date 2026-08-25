using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace QueDetallitoAdmin.Entities.Production
{
    public class CalendarGroupPost
    {
        public DateTime GroupDate { get; set; }
        public IEnumerable<CalendarPost> Calendars { get; set; }
    }
}
