using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using QueDetallitoAdmin.Entities;
using QueDetallitoAdmin.Models;
using QueDetallitoAdmin.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace QueDetallitoAdmin.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class AccountController : Controller
    {
        private readonly string _key = "_rtam";
        private readonly IAccountService _accountService;
        public AccountController(IAccountService accountService)
        {
            _accountService = accountService;
        }

        [AllowAnonymous]
        [HttpPost]
        public async Task<IActionResult> Authenticate([FromBody] Login login)
        {
            IActionResult response = Unauthorized();
            var account = await _accountService.Authenticate(login);
            if (account != null)
            {
                SetTokenCookie(account.RefreshToken);
                response = Ok(new { token = account.JwtToken });
            }
            return response;
        }

        [AllowAnonymous]
        [HttpPost("IsResetPasswordRequired")]
        public async Task<IActionResult> IsResetPasswordRequired(Login login)
        {
            var reset = await _accountService.IsResetPasswordRequired(login);
            return Ok(new { reset = reset });
        }

        [AllowAnonymous]
        [HttpPost("RefreshToken")]
        public async Task<IActionResult> RefreshToken()
        {
            IActionResult response = BadRequest();
            var refreshToken = Request.Cookies[_key];
            if (refreshToken != null)
            {
                var account = await _accountService.RefreshToken(refreshToken);
                SetTokenCookie(account.RefreshToken);
                response = Ok(new { token = account.JwtToken });
            }
            return response;
        }

        [Authorize]
        [HttpPost("RevokeToken")]
        public async Task<IActionResult> RevokeToken()
        {
            IActionResult response = BadRequest();
            var claims = HttpContext.User.Claims;
            var token = Request.Cookies[_key];
            if (claims.Any(c => c.Type == ClaimTypes.NameIdentifier))
            {
                int accountId = int.Parse(claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier).Value);
                await _accountService.RevokeToken(accountId);
                SetTokenCookie(token, true);
                response = Ok(new { message = "La sesión se cerró correctamente" });
            }
            return response;
        }

        [Authorize]
        [HttpGet("GetAccountData")]
        public IActionResult GetAccountData()
        {
            IActionResult response = BadRequest();
            var claims = HttpContext.User.Claims;
            if (claims.Any(c => c.Type == ClaimTypes.NameIdentifier))
            {
                var account = new UserData
                {
                    ID = int.Parse(claims.FirstOrDefault(v => v.Type == ClaimTypes.NameIdentifier).Value),
                    Name = claims.FirstOrDefault(v => v.Type == ClaimTypes.Name).Value,
                    LastName = claims.FirstOrDefault(v => v.Type == "LastName").Value,
                    Email = claims.FirstOrDefault(v => v.Type == ClaimTypes.Email).Value
                };
                response = Ok(account);
            }
            return response;
        }

        [Authorize]
        [HttpGet("GetAccounts")]
        public async Task<IActionResult> GetAccounts()
        {
            var list = await _accountService.GetAccounts();
            return Ok(list);
        }

        [Authorize]
        [HttpPut("AddAccount")]
        public async Task<IActionResult> AddAccount(AccountModel account)
        {
            await _accountService.AddAccount(account, Request.Headers["origin"]);
            return Ok(new { message = "Se agregó al usuario correctamente" });
        }

        [Authorize]
        [HttpPatch("UpdateAccount")]
        public async Task<IActionResult> UpdateAccount(AccountModel account)
        {
            await _accountService.UpdateAccount(account);
            return Ok(new { message = "Se actualizó la cuenta correctamente" });
        }

        [Authorize]
        [HttpPost("ResetAccountPassword")]
        public async Task<IActionResult> ResetAccountPassword(ResetAccount account)
        {
            await _accountService.ResetAccountPassword(account, Request.Headers["origin"]);
            return Ok(new { message = "Se restableció la contraseña correctamente" });
        }

        [AllowAnonymous]
        [HttpPost("UpdateAccountPassword")]
        public async Task<IActionResult> UpdateAccountPassword(Login login)
        {
            IActionResult response = BadRequest();

            //Actualiza la contraseña
            await _accountService.UpdateAccountPassword(login);

            //Autentifica el usuario
            var account = await _accountService.Authenticate(login);
            if (account != null)
            {
                SetTokenCookie(account.RefreshToken);
                response = Ok(new { token = account.JwtToken });
            }
            return response;
        }

        private void SetTokenCookie(string token, Nullable<bool> delete = null)
        {
            var cookieOptions = new CookieOptions();
            cookieOptions.HttpOnly = true;
            if (delete != null)
            {
                cookieOptions.Expires = DateTime.UtcNow.AddMonths(-1);
            }
            else
            {
                cookieOptions.Expires = DateTime.UtcNow.AddMonths(1);
            }
            Response.Cookies.Append(_key, token, cookieOptions);
        }
    }
}
