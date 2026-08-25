using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace QueDetallito.Entities.Checkout
{
    public class CheckoutResponse
    {
        public bool Success { get; set; }
        public bool RequiresAction { get; set; }
        public string ClientSecret { get; set; }
        public int IdOrder { get; set; }
        public int OrderYear { get; set; }
    }
}
