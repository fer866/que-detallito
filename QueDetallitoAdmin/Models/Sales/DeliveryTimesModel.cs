using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace QueDetallitoAdmin.Models.Sales
{
    public class DeliveryTimesModel
    {
        public int ID { get; set; }
        public string Name { get; set; }
        private TimeSpan startTime;
        public TimeSpan StartTime 
        {
            get { return startTime; }
            set
            {
                startTime = value;
                if (startTimeStr == null)
                    startTimeStr = value.ToString(@"hh\:mm");
            }
        }
        private TimeSpan endTime;
        public TimeSpan EndTime 
        { 
            get { return endTime; }
            set
            {
                endTime = value;
                if (endTimeStr == null)
                    endTimeStr = value.ToString(@"hh\:mm");
            }
        }
        private string startTimeStr;
        public string StartTimeStr
        {
            get { return startTimeStr; }
            set 
            {
                startTimeStr = value;
                if (startTime == default)
                    startTime = TimeSpan.Parse(value);
            }
        }
        private string endTimeStr;
        public string EndTimeStr
        {
            get { return endTimeStr; }
            set 
            { 
                endTimeStr = value;
                if (endTime == default)
                    endTime = TimeSpan.Parse(value);
            }
        }
        public bool Saturday { get; set; }
        public bool Sunday { get; set; }
        private TimeSpan maxTime;

        public TimeSpan MaxTime
        {
            get { return maxTime; }
            set 
            {
                maxTime = value;
                if (maxTimeStr == null)
                    maxTimeStr = value.ToString(@"hh\:mm");
            }
        }
        private string maxTimeStr;

        public string MaxTimeStr
        {
            get { return maxTimeStr; }
            set 
            { 
                maxTimeStr = value;
                if (maxTime == default)
                    maxTime = TimeSpan.Parse(value);
            }
        }

        public DateTime Created { get; set; }
        public bool Active { get; set; }
    }
}
