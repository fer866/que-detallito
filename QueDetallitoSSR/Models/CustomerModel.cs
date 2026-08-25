using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace QueDetallito.Models
{
    public class CustomerModel
    {
        public int ID { get; set; }
        public string Name { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public string CountryCode { get; set; }
        public string Password { get; set; }
        public Nullable<DateTime> LastAccess { get; set; }
        public DateTime Created { get; set; }
        public bool Verified { get; set; }
        public string VerificationToken { get; set; }
        public string RefreshToken { get; set; }
        public Nullable<DateTime> RefreshTokenExpires { get; set; }
        public string ResetToken { get; set; }
        public Nullable<DateTime> ResetTokenExpires { get; set; }
        public string PayUserId { get; set; }
        public string ChangeEmail { get; set; }
    }
}
