using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace QueDetallito.Entities
{
    public class ChangeCustomerData
    {
        public int IdCustomer { get; set; }
        public string OldPassword { get; set; }
        public string Password { get; set; }
        public string Email { get; set; }
    }
}
