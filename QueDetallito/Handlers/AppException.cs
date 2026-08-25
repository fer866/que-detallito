using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;

namespace QueDetallito.Handlers
{
    public class AppException : Exception
    {
        public bool Persist { get; set; }
        public bool RequiresAction { get; set; }
        public AppException() : base() { }
        public AppException(string message) : base(message) { }
        public AppException(string message, bool persist) : base(string.Format(CultureInfo.CurrentCulture, message))
        {
            Persist = persist;
        }
        public AppException(string message, bool persist, bool requiresAction): base(string.Format(CultureInfo.CurrentCulture, message))
        {
            Persist = persist;
            RequiresAction = requiresAction;
        }
    }
}
