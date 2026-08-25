using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace QueDetallito
{
    public static class DateTimeExtensions
    {
        private static readonly TimeZoneInfo _timeZone;
        static DateTimeExtensions()
        {
            _timeZone = TimeZoneInfo.FindSystemTimeZoneById("Central Standard Time (Mexico)");
        }

        public static DateTime LocalTime(this DateTime dt)
        {
            return TimeZoneInfo.ConvertTime(dt, _timeZone);
        }

        public static DateTime StartOfWeek(this DateTime dt, DayOfWeek startOfWeek)
        {
            int diff = (7 + (dt.DayOfWeek - startOfWeek)) % 7;
            return dt.AddDays(-1 * diff).Date;
        }

        public static DateTime EndOfWeek(this DateTime dt, DayOfWeek endOfWeek)
        {
            int diff = (7 + (endOfWeek - dt.DayOfWeek)) % 7;
            return dt.AddDays(diff).Date;
        }

        public static string ToUpperFirst(this string s)
        {
            if (string.IsNullOrEmpty(s))
            {
                return string.Empty;
            }
            char[] a = s.ToCharArray();
            a[0] = char.ToUpper(a[0]);
            return new string(a);
        }
    }
}
