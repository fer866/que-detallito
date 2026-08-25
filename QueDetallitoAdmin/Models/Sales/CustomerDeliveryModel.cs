using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace QueDetallitoAdmin.Models.Sales
{
    public class CustomerDeliveryModel
    {
        public int IdDelivery { get; set; }
        public int IdCustomer { get; set; }
        public string Alias { get; set; }
        public string NameDelivery { get; set; }
        public string Phone { get; set; }
        public string ZipCode { get; set; }
        public string Street { get; set; }
        public string Number { get; set; }
        public string Suburb { get; set; }
        public string Town { get; set; }
        public string State { get; set; }
        public decimal Longitude { get; set; }
        public decimal Latitude { get; set; }
        public string SpecialAddress { get; set; }
        public DateTime Created { get; set; }
        public Nullable<DateTime> Modified { get; set; }
        public bool Active { get; set; }
    }
}
