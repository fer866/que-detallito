using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace QueDetallito.Entities
{
    public class CustomerRegister
    {
        public string Name { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public string CountryCode { get; set; }
        public string Password { get; set; }
        public string RepeatPassword { get; set; }
        public bool NoticePrivacy { get; set; }
    }
}
