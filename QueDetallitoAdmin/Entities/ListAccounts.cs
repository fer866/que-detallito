using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace QueDetallitoAdmin.Entities
{
    public class ListAccounts
    {
        public int ID { get; set; }
        public int IdRole { get; set; }
        public string RoleName { get; set; }
        public string Name { get; set; }
        public string LastName { get; set; }
        private string fullName;

        public string FullName
        {
            get
            {
                if (fullName != null)
                {
                    return fullName;
                }
                else
                {
                    return Name + " " + LastName;
                }
            }
            set { fullName = value; }
        }
        public string Email { get; set; }
        public string Phone { get; set; }
        public string RFC { get; set; }
        public Nullable<DateTime> LastAccess { get; set; }
        public bool Active { get; set; }

    }
}
