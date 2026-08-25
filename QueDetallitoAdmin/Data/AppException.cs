using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;

namespace QueDetallitoAdmin.Data
{
    public class AppException : Exception
    {
        public bool Persist { get; set; }
        public AppException() : base() { }
        public AppException(string message) : base(message) { }
        public AppException(string message, bool persist) : base(String.Format(CultureInfo.CurrentCulture, message)) 
        {
            Persist = persist;
        }
    }
}
