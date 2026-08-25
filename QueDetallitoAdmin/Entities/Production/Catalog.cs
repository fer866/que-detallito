using QueDetallitoAdmin.Models.Production;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace QueDetallitoAdmin.Entities.Production
{
    public class Catalog
    {
        public int IdCatalog { get; set; }
        private string nameDb;

        public string NameDb
        {
            get
            {
                if (nameDb != null)
                    return nameDb;
                switch (IdCatalog)
                {
                    case 1:
                        nameDb = "Production.Categories";
                        break;
                    case 2:
                        nameDb = "Sales.OrderStatus";
                        break;
                    case 3:
                        nameDb = "Sales.PaymentMethods";
                        break;
                    case 4:
                        nameDb = "Admon.Roles";
                        break;
                }
                return nameDb;
            }
            set { nameDb = value; }
        }
        public CatalogModel CurrentCatalog { get; set; }
    }
}
