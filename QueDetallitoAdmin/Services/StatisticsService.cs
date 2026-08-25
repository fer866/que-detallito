using QueDetallitoAdmin.Data;
using QueDetallitoAdmin.Entities.Statistics;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Dapper;
using QueDetallitoAdmin.Models.Statistics;

namespace QueDetallitoAdmin.Services
{
    public interface IStatisticsService
    {
        Task<IEnumerable<StatisticSales>> GetTotals();
        Task<IEnumerable<StatisticsNumbers>> GetNumbers(int option);
    }
    public class StatisticsService : IStatisticsService
    {
        private readonly IDatabaseConnection _context;
        public StatisticsService(IDatabaseConnection context)
        {
            _context = context;
        }

        public async Task<IEnumerable<StatisticSales>> GetTotals()
        {
            using var conn = await _context.CreateConnectionAsync();

            //Todas las ventas del año
            DateTime firstOfYear = new DateTime(DateTime.Now.LocalTime().Year, 1, 1);
            var paramYear = new { first = firstOfYear, last = firstOfYear.AddYears(1) };
            var salesYear = await conn.QueryAsync<SalesAmountsView>("select * from Sales.ViewSalesAmounts where created between @first and @last", paramYear);

            List<StatisticSales> statistics = new List<StatisticSales>();
            var sales = new StatisticSales();

            //Ventas del día
            var atDay = salesYear.Where(s => s.Created >= DateTime.Now.LocalTime().Date && s.Created <= DateTime.Now.LocalTime().Date.AddDays(1));
            sales = new StatisticSales();
            sales.GrossAmount = atDay.Sum(s => s.GrossAmount);
            sales.NetAmount = atDay.Sum(s => s.NetAmount);
            sales.Count = atDay.Select(s => s.IdOrder).Distinct().Count();
            sales.Description = "Ventas en el día";
            statistics.Add(sales);

            //Ventas de la semana
            var atWeek = salesYear.Where(s => s.Created >= DateTime.Now.LocalTime().StartOfWeek(DayOfWeek.Monday) && s.Created <= DateTime.Now.LocalTime().EndOfWeek(DayOfWeek.Sunday));
            sales = new StatisticSales();
            sales.GrossAmount = atWeek.Sum(s => s.GrossAmount);
            sales.NetAmount = atWeek.Sum(s => s.NetAmount);
            sales.Count = atWeek.Select(s => s.IdOrder).Distinct().Count();
            //var paramWeek = new { monday = DateTime.Now.LocalTime().StartOfWeek(DayOfWeek.Monday), sunday = DateTime.Now.LocalTime().EndOfWeek(DayOfWeek.Sunday) };
            //sales = await conn.QuerySingleOrDefaultAsync<StatisticSales>("select count(distinct(IdOrder)) Count,SUM(GrossAmount) GrossAmount,SUM(NetAmount) NetAmount " +
            //    "from Sales.ViewSalesAmounts where created between @monday and @sunday", paramWeek);
            //if (sales == null)
            //    sales = new StatisticSales();
            sales.Description = "Ventas de esta semana";
            statistics.Add(sales);

            //Ventas del mes
            DateTime firstOfMonth = new DateTime(DateTime.Now.LocalTime().Year, DateTime.Now.LocalTime().Month, 1).Date;
            var atMonth = salesYear.Where(s => s.Created >= firstOfMonth && s.Created <= firstOfMonth.AddMonths(1).AddDays(-1));
            sales = new StatisticSales();
            sales.GrossAmount = atMonth.Sum(s => s.GrossAmount);
            sales.NetAmount = atMonth.Sum(s => s.NetAmount);
            sales.Count = atMonth.Select(s => s.IdOrder).Distinct().Count();
            //var paramMonth = new { first = firstOfMonth, last = firstOfMonth.AddMonths(1).AddDays(-1) };
            //sales = await conn.QuerySingleOrDefaultAsync<StatisticSales>("select count(distinct(IdOrder)) Count,SUM(GrossAmount) GrossAmount,SUM(NetAmount) NetAmount " +
            //    "from Sales.ViewSalesAmounts where created between @first and @last", paramMonth);
            //if (sales == null)
            //    sales = new StatisticSales();
            sales.Description = "Ventas de este mes";
            statistics.Add(sales);

            //Ventas del año
            sales = new StatisticSales();
            sales.GrossAmount = salesYear.Sum(s => s.GrossAmount);
            sales.NetAmount = salesYear.Sum(s => s.NetAmount);
            sales.Count = salesYear.Select(s => s.IdOrder).Distinct().Count();
            //DateTime firstOfYear = new DateTime(DateTime.Now.LocalTime().Year, 1, 1);
            //var paramYear = new { first = firstOfYear, last = firstOfYear.AddYears(1) };
            //sales = await conn.QuerySingleOrDefaultAsync<StatisticSales>("select count(distinct(IdOrder)) Count,SUM(GrossAmount) GrossAmount,SUM(NetAmount) NetAmount " +
            //    "from Sales.ViewSalesAmounts where created between @first and @last", paramYear);
            //if (sales == null)
            //    sales = new StatisticSales();
            sales.Description = "Venta de todo el año";
            statistics.Add(sales);

            return statistics;
        }

        public async Task<IEnumerable<StatisticsNumbers>> GetNumbers(int option)
        {
            using var conn = await _context.CreateConnectionAsync();

            List<StatisticsNumbers> numbers = new List<StatisticsNumbers>();
            var dates = GetNumbersDate(option);
            var param = new { dateFrom = dates.Item1, dateTo = dates.Item2 };

            //Usuarios nuevos
            var newUsers = await conn.QuerySingleAsync<int>("select count(*) from Sales.Customers " +
                "where CONVERT(DATE,Created) between CONVERT(DATE,@dateFrom) and CONVERT(DATE,@dateTo)", param);
            numbers.Add(new StatisticsNumbers { Count = newUsers, Name = "Nuevos usuarios" });

            //Productos como favoritos
            var wishlist = await conn.QuerySingleAsync<int>("select count(*) from Sales.WishProducts " +
                "where CONVERT(DATE,Created) between CONVERT(DATE,@dateFrom) and CONVERT(DATE,@dateTo)", param);
            numbers.Add(new StatisticsNumbers { Count = wishlist, Name = "Favoritos" });

            //Productos en carrito
            var cart = await conn.QuerySingleAsync<int>("select count(*) from Sales.Cart " +
                "where CONVERT(DATE,Created) between CONVERT(DATE,@dateFrom) and CONVERT(DATE,@dateTo)", param);
            numbers.Add(new StatisticsNumbers { Count = cart, Name = "En carrito" });

            return numbers;
        }

        private (DateTime, DateTime) GetNumbersDate(int option)
        {
            var dateFrom = DateTime.Now.LocalTime().Date;
            var dateTo = dateFrom.Date;
            switch (option)
            {
                case 2: //this week
                    dateFrom = dateFrom.StartOfWeek(DayOfWeek.Monday).Date;
                    dateTo = dateTo.EndOfWeek(DayOfWeek.Sunday).Date;
                    break;
                case 3: //this month
                    dateFrom = new DateTime(dateFrom.Year, dateFrom.Month, 1).Date;
                    dateTo = dateTo.AddMonths(1).AddDays(-1).Date;
                    break;
            }
            return (dateFrom, dateTo);
        }
    }
}
