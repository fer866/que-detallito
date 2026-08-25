using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace QueDetallitoAdmin.Entities.Sales
{
    public class OrderParamPost
    {
        public int ID { get; set; }
        public int OrderYear { get; set; }
        public int IdStatus { get; set; }
        public string PaymentCancelation { get; set; }
        public string Remark { get; set; }
    }
}
