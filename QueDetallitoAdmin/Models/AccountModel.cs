using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace QueDetallitoAdmin.Models
{
    public class AccountModel
    {
        public int ID { get; set; }
        public int IdRole { get; set; }
        public string Name { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public string RFC { get; set; }
        public string Password { get; set; }
        public string RefreshToken { get; set; }
        public Nullable<DateTime> RefreshTokenExpires { get; set; }
        public Nullable<DateTime> LastAccess { get; set; }
        public Nullable<DateTime> ResetRequest { get; set; }
        public bool Active { get; set; }
    }
}
