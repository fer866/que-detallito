using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QueDetallitoAdmin.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace QueDetallitoAdmin.Controllers
{
    [ApiController]
    [Route("[controller]")]
    [Authorize]
    public class StatisticsController : Controller
    {
        private readonly IStatisticsService _statisticsService;
        public StatisticsController(IStatisticsService statisticsService)
        {
            _statisticsService = statisticsService;
        }

        [HttpGet]
        public async Task<IActionResult> GetTotals()
        {
            var totals = await _statisticsService.GetTotals();
            return Ok(totals);
        }

        [HttpGet("GetNumbers/{option}")]
        public async Task<IActionResult> GetNumbers(int option)
        {
            var numbers = await _statisticsService.GetNumbers(option);
            return Ok(numbers);
        }
    }
}
