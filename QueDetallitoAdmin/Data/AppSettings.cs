using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace QueDetallitoAdmin.Data
{
    public class AppSettings
    {
        public string Secret { get; set; }
        public string EmailFrom { get; set; }
        public string SmtpHost { get; set; }
        public int SmtpPort { get; set; }
        public string SmtpUser { get; set; }
        public string SmtpPass { get; set; }
        public string EmailFromCustomer { get; set; }
        public string SmtpUserCustomer { get; set; }
        public string SmtpPassCustomer { get; set; }
    }
}
