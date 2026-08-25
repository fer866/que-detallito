using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace QueDetallito.Entities.Sales
{
    public class CartVerification
    {
        public bool IsValid { get; set; }
        public int MinutesLeft { get; set; }
    }
}
