using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace QueDetallitoAdmin.Entities
{
    public class UserData
    {
        public int ID { get; set; }
        public string Name { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        private string fullName;

        public string FullName
        {
            get
            {
                if (fullName == null)
                {
                    return $"{Name} {LastName}";
                }
                else
                {
                    return fullName;
                }
            }
            set { fullName = value; }
        }

    }
}
