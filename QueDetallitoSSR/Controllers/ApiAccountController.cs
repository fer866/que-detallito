using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QueDetallito.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using QueDetallito.Services;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace QueDetallito.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ApiAccountController : Controller
    {
        private readonly IAccountService _accountService;
        public ApiAccountController(IAccountService accountService)
        {
            _accountService = accountService;
        }

        [AllowAnonymous]
        [HttpPost]
        public async Task<IActionResult> Authenticate([FromBody]LoginModel login)
        {
            IActionResult response = Unauthorized();
            var user = await _accountService.Authenticate(login);
            if (user != null)
            {
                SetTokenCookie(user.RefreshToken);
                response = Ok(new { token = user.JwtToken });
            }
            return response;
        }

        [AllowAnonymous]
        [HttpPost("RefreshToken")]
        public async Task<IActionResult> RefreshToken()
        {
            IActionResult response = BadRequest();
            var refreshToken = Request.Cookies["_rt"];
            if (refreshToken != null)
            {
                var user = await _accountService.RefreshToken(refreshToken);
                SetTokenCookie(user.RefreshToken);
                response = Ok(new { token = user.JwtToken });
            }
            return response;
        }

        [Authorize]
        [HttpPost("RevokeToken")]
        public async Task<IActionResult> RevokeToken()
        {
            IActionResult response = BadRequest();
            var token = Request.Cookies["_rt"];
            if (token != null)
            {
                await _accountService.RevokeToken(token);
                SetTokenCookie(token, true);
                response = Ok(new { message = "La sesión se cerró, te esperamos pronto." });
            }
            return response;
        }

        [AllowAnonymous]
        [HttpPost("Register")]
        public async Task<IActionResult> Register([FromBody]CustomerRegister customer)
        {
            await _accountService.Register(customer, Request.Headers["origin"]);
            return Ok(new { message = "Gracias por registrarte, porfavor verifica tu correo para continuar con tu registro" });
        }

        [AllowAnonymous]
        [HttpPost("VerifyEmail")]
        public async Task<IActionResult> VerifyEmail([FromBody]LoginModel login)
        {
            await _accountService.VerifyEmail(login);
            return Ok(new { message = "Verificación completa, ya puedes iniciar sesión en tu cuenta" });
        }

        [AllowAnonymous]
        [HttpPost("ForgotPassword")]
        public async Task<IActionResult> ForgotPassword(LoginModel login)
        {
            await _accountService.ForgotPassword(login.User, Request.Headers["origin"]);
            return Ok(new { message = "Porfavor revisa tu correo para restablecer tu contraseña" });
        }

        [AllowAnonymous]
        [HttpPost("VerifyResetPasswordToken")]
        public async Task<IActionResult> VerifyResetPasswordToken([FromBody]LoginModel login)
        {
            await _accountService.ValidateResetToken(login);
            return Ok(new { message = "Token válido" });
        }

        [AllowAnonymous]
        [HttpPost("ResetPassword")]
        public async Task<IActionResult> ResetPassword([FromBody] LoginModel login)
        {
            await _accountService.ResetPassword(login);
            return Ok(new { message = "Se restableció la contraseña correctamente" });
        }

        [Authorize]
        [HttpPatch("ChangePassword")]
        public async Task<IActionResult> ChangePassword(ChangeCustomerData change)
        {
            var claims = HttpContext.User.Claims;
            var accountId = int.Parse(claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier).Value);
            change.IdCustomer = accountId;
            await _accountService.ChangePassword(change);

            return Ok(new { message = "Se cambió tu contraseña correctamente" });
        }

        [Authorize]
        [HttpPatch("ChangeEmail")]
        public async Task<IActionResult> ChangeEmail(ChangeCustomerData change)
        {
            var claims = HttpContext.User.Claims;
            var accountId = int.Parse(claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier).Value);
            change.IdCustomer = accountId;
            await _accountService.ChangeEmail(change, Request.Headers["origin"]);

            return Ok(new { message = "Cambiamos tu correo, revisa tu bandeja de entrada para volver a iniciar sesión" });
        }

        [Authorize]
        [HttpGet("GetUserData")]
        public async Task<IActionResult> GetUserData()
        {
            IActionResult response = NotFound(new { message = "No fue posible obtener los datos de usuario" });
            var claims = HttpContext.User.Claims;
            if (claims.Any(c => c.Type == ClaimTypes.NameIdentifier))
            {
                var account = new UserData
                {
                    Name = claims.FirstOrDefault(c => c.Type == ClaimTypes.Name).Value,
                    LastName = claims.FirstOrDefault(c => c.Type == "LastName").Value,
                    Email = claims.FirstOrDefault(c => c.Type == ClaimTypes.Email).Value,
                    Phone = claims.FirstOrDefault(c => c.Type == ClaimTypes.MobilePhone).Value
                };
                response = Ok(account);
            }
            return await Task.FromResult(response);
        }

        [Authorize]
        [HttpGet("GetDeliveries")]
        public async Task<IActionResult> GetDeliveries()
        {
            IActionResult response = Unauthorized();
            var claims = HttpContext.User.Claims;
            if (claims.Any(c => c.Type == ClaimTypes.NameIdentifier))
            {
                var accountId = int.Parse(claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier).Value);
                var deliveries = await _accountService.GetDeliveries(accountId);
                response = Ok(deliveries);
            }
            return response;
        }

        [Authorize]
        [HttpPost("AddDelivery")]
        public async Task<IActionResult> AddDelivery([FromBody]Deliveries delivery)
        {
            var claims = HttpContext.User.Claims;
            var accountId = int.Parse(claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier).Value);
            await _accountService.AddDelivery(delivery, accountId);

            return Ok(new { message = "Se agregó la nueva dirección de entrega" });
        }

        [Authorize]
        [HttpGet("GetZipCodeData/{zipCode}")]
        public async Task<IActionResult> GetZipCodeData(string zipCode)
        {
            var zipCodeData = await _accountService.GetZipCodeData(zipCode);
            return Ok(zipCodeData);
        }

        [Authorize]
        [HttpPatch("UpdateDelivery")]
        public async Task<IActionResult> UpdateDelivery([FromBody]Deliveries delivery)
        {
            var claims = HttpContext.User.Claims;
            var accountId = int.Parse(claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier).Value);
            await _accountService.UpdateDelivery(delivery, accountId);

            return Ok(new { message = "Se actualizó la dirección de entrega" });
        }

        [Authorize]
        [HttpDelete("DeleteDelivery/{idDelivery}")]
        public async Task<IActionResult> DeleteDelivery(int idDelivery)
        {
            var claims = HttpContext.User.Claims;
            var accountId = int.Parse(claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier).Value);
            await _accountService.DeleteDelivery(idDelivery, accountId);

            return Ok(new { message = "Se eliminó la dirección de entrega" });
        }

        [Authorize]
        [HttpPatch("UpdateAccountInfo")]
        public async Task<IActionResult> UpdateAccountInfo(UserData user)
        {
            var claims = HttpContext.User.Claims;
            var accountId = int.Parse(claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier).Value);
            await _accountService.UpdatePersonalData(user, accountId);

            return Ok(new { message = "¡Hemos actualizado tu información!" });
        }

        [HttpPost("ResendEmailConfirmation")]
        public async Task<IActionResult> ResendEmailConfirmation(LoginModel login)
        {
            await _accountService.ResendEmailConfirmation(login, Request.Headers["origin"]);
            return Ok(new { message = "Se envió el correo de verificación" });
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
            Response.Cookies.Append("_rt", token, cookieOptions);
        }
    }
}
