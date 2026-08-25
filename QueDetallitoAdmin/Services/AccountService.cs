using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using QueDetallitoAdmin.Data;
using QueDetallitoAdmin.Entities;
using QueDetallitoAdmin.Models;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using Dapper;
using BC = BCrypt.Net.BCrypt;

namespace QueDetallitoAdmin.Services
{
    public interface IAccountService
    {
        Task<UserLogin> Authenticate(Login login);
        Task<UserLogin> RefreshToken(string token);
        Task RevokeToken(int id);
        Task<IEnumerable<ListAccounts>> GetAccounts();
        Task AddAccount(AccountModel account, string origen);
        Task UpdateAccountPassword(Login login);
        Task UpdateAccount(AccountModel account);
        Task ResetAccountPassword(ResetAccount account, string origin);
        Task<bool> IsResetPasswordRequired(Login login);
    }
    public class AccountService : IAccountService
    {
        private readonly AppSettings _config;
        private readonly IDatabaseConnection _context;
        private readonly IEmailService _emailService;
        public AccountService(IOptions<AppSettings> config, IDatabaseConnection context, IEmailService emailService)
        {
            _config = config.Value;
            _context = context;
            _emailService = emailService;
        }

        public async Task<UserLogin> Authenticate(Login login)
        {
            using var conn = await _context.CreateConnectionAsync();
            var account = await conn.QueryFirstOrDefaultAsync<AccountModel>("select top 1 * from Admon.Users where email = @Email", login);

            if (account == null)
                throw new AppException("Ups, al parecer tu cuenta no está registrado, verifícalo con el administrador");
            else if (!account.Active)
                throw new AppException("Lo siento, tu usuario está inactivo, verifica con el administrador");
            else if (!BC.Verify(login.Password, account.Password))
                throw new AppException("Contraseña incorrecta, verifica e intenta de nuevo");

            //Authentication successful
            var jwtToken = GenerateJwtToken(account);
            var refreshToken = GenerateRefreshToken();
            account.RefreshToken = refreshToken.Token;
            account.RefreshTokenExpires = refreshToken.Expires;
            account.LastAccess = DateTime.Now.LocalTime();

            //Update table
            await conn.ExecuteAsync("update Admon.Users set " +
                "RefreshToken = @RefreshToken, " +
                "RefreshTokenExpires = @RefreshTokenExpires, " +
                "LastAccess = @LastAccess " +
                "where id = @ID", account);

            UserLogin user = new UserLogin
            {
                ID = account.ID,
                Email = account.Email,
                JwtToken = jwtToken,
                RefreshToken = refreshToken.Token
            };
            return await Task.FromResult(user);
        }

        public async Task<UserLogin> RefreshToken(string token)
        {
            var account = await GetRefreshToken(token);

            //Get old token and update
            var refreshToken = GenerateRefreshToken();
            account.RefreshToken = refreshToken.Token;
            account.RefreshTokenExpires = refreshToken.Expires;
            account.LastAccess = DateTime.Now.LocalTime();
            using var conn = await _context.CreateConnectionAsync();
            await conn.ExecuteAsync("update Admon.Users set " +
                "RefreshToken = @RefreshToken, " +
                "RefreshTokenExpires = @RefreshTokenExpires, " +
                "LastAccess = @LastAccess " +
                "where ID = @ID", account);

            //Generate Jwt
            var jwtToken = GenerateJwtToken(account);

            UserLogin user = new UserLogin
            {
                ID = account.ID,
                Email = account.Email,
                JwtToken = jwtToken,
                RefreshToken = refreshToken.Token
            };
            return user;
        }

        public async Task RevokeToken(int id)
        {
            using var conn = await _context.CreateConnectionAsync();
            var account = new AccountModel
            {
                ID = id,
                RefreshToken = null,
                RefreshTokenExpires = null
            };

            await conn.ExecuteAsync("update Admon.Users set " +
                "refreshToken = @RefreshToken, " +
                "refreshTokenExpires = @RefreshTokenExpires " +
                "where id = @ID", account);
        }

        public async Task<IEnumerable<ListAccounts>> GetAccounts()
        {
            using var conn = await _context.CreateConnectionAsync();
            var list = await conn.QueryAsync<ListAccounts>("select * from Admon.ViewUsers");

            return list;
        }

        public async Task AddAccount(AccountModel account, string origin)
        {
            using var conn = await _context.CreateConnectionAsync();
            var email = await conn.QuerySingleOrDefaultAsync<string>("select top 1 email from Admon.Users where email = @Email", account);
            if (email != null)
                throw new AppException($"La cuenta ya existe con el correo {account.Email}. Favor de verificar");

            var refreshToken = GenerateRefreshToken();

            account.RefreshToken = refreshToken.Token;
            account.RefreshTokenExpires = refreshToken.Expires;
            string accountPsw = account.Password;
            account.Password = BC.HashPassword(account.Password);
            account.ResetRequest = DateTime.Now.LocalTime().AddDays(1);

            await SendWelcomeEmail(account, accountPsw, origin);

            await conn.ExecuteAsync("insert into Admon.Users values (" +
                "@IdRole, @Name, @LastName, @Email, @Phone, @RFC, @Password, @RefreshToken, @RefreshTokenExpires, " +
                "@LastAccess, @ResetRequest, @Active)", account);
        }

        public async Task UpdateAccountPassword(Login login)
        {
            using var conn = await _context.CreateConnectionAsync();

            var account = await conn.QuerySingleOrDefaultAsync<AccountModel>("select top 1 * from Admon.Users where email = @Email", login);
            if (account == null)
                throw new AppException("El usuario no existe, verifica e intenta nuevamente");
            if (account.ResetRequest == null)
                throw new AppException("Ups, el usuario no está habilitado para restablecer su contraseña, verifica con el administrador");
            if (account.ResetRequest < DateTime.Now.LocalTime())
                throw new AppException("El tiempo para restablecer tu contraseña ha caducado, solicita al administrador que la restablezca nuevamente");

            account.Password = BC.HashPassword(login.Password);
            account.ResetRequest = null;

            await conn.ExecuteAsync("update Admon.Users set " +
                "password = @Password, " +
                "resetRequest = @ResetRequest " +
                "where id = @ID", account);
        }

        public async Task UpdateAccount(AccountModel account)
        {
            using var conn = await _context.CreateConnectionAsync();
            
            await conn.ExecuteAsync("update Admon.Users set " +
                "idRole = @IdRole, " +
                "name = @Name, " +
                "lastName = @LastName, " +
                "email = @Email, " +
                "phone = @Phone, " +
                "rfc = @RFC, " +
                "active = @Active " +
                "where id = @ID", account);
        }

        public async Task ResetAccountPassword(ResetAccount account, string origin)
        {
            using var conn = await _context.CreateConnectionAsync();
            var mAccount = await conn.QuerySingleOrDefaultAsync<AccountModel>("select * from Admon.Users where id = @ID", account);
            var param = new { id = account.ID, reset = DateTime.Now.LocalTime().AddDays(1), pass = BC.HashPassword(account.Password) };

            await SendResetPasswordEmail(mAccount, account.Password, origin);

            await conn.ExecuteAsync("update Admon.Users set " +
                "Password = @pass, " +
                "ResetRequest = @reset " +
                "where id = @id", param);
        }

        public async Task<bool> IsResetPasswordRequired(Login login)
        {
            using var conn = await _context.CreateConnectionAsync();
            var account = await conn.QuerySingleOrDefaultAsync<AccountModel>("select * from Admon.Users where email = @Email", login);

            if (account == null)
                throw new AppException("El usuario no existe, favor de verificar");
            else if (!account.Active)
                throw new AppException("Lo siento pero tu cuenta está desactivada, verifica con el administrador");
            else if (!BC.Verify(login.Password, account.Password))
                throw new AppException("La contraseña es incorrecta, favor de verificar");

            return account.ResetRequest == null ? false : true;
        }

        private async Task<AccountModel> GetRefreshToken(string token)
        {
            using var conn = await _context.CreateConnectionAsync();
            var param = new { token = token };
            var account = await conn.QueryFirstOrDefaultAsync<AccountModel>("select top 1 * from Admon.Users where RefreshToken = @token", param);

            if (account == null)
                throw new AppException("Sesión inválida, vuelva a iniciar sesión");
            else if (!account.Active)
                throw new AppException("Tu cuenta está inactiva, verifique con el administrador");
            else if (account.ResetRequest != null)
                throw new AppException("Restablecieron la contraseña de tu cuenta, es necesario que vuelvas a iniciar sesión");

            return account;
        }

        private string GenerateJwtToken(AccountModel account)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config.Secret));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, account.ID.ToString()),
                new Claim(ClaimTypes.Name, account.Name),
                new Claim("LastName", account.LastName),
                new Claim(ClaimTypes.Email, account.Email),
                new Claim(ClaimTypes.Role, account.IdRole.ToString())
            };
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddHours(1),
                SigningCredentials = creds
            };
            var handler = new JwtSecurityTokenHandler();
            var token = handler.CreateToken(tokenDescriptor);
            return handler.WriteToken(token);
        }

        private RefreshToken GenerateRefreshToken()
        {
            return new RefreshToken
            {
                Token = RandomTokenString(),
                Expires = DateTime.UtcNow.AddDays(15),
                Created = DateTime.UtcNow
            };
        }

        private string RandomTokenString()
        {
            using var rngCrypto = new RNGCryptoServiceProvider();
            var randomBytes = new byte[40];
            rngCrypto.GetBytes(randomBytes);
            //Convert random bytes to hex string
            return BitConverter.ToString(randomBytes).Replace("-", "");
        }

        private async Task SendWelcomeEmail(AccountModel account, string accountPsw, string origin)
        {
            if (string.IsNullOrEmpty(origin))
            {
                origin = "https://admin.quedetallito.com";
            }

            string message = @"<div style=""font-family:'Helvetica Neue',sans-serif"">" +
                @"<h1 style=""color:#9c27b0;margin-bottom:5px;"">Que Detallito Admin</h1>" +
                @"<p style=""margin:0""><em>Donde tus regalos se vuelven grandes</em></p><br>" +
                $"<h3>¡Hola {account.Name}, bienvenid@ a la familia!</h3><br>" +
                "<p>A todo el equipo de Que Detallito nos complace tenerte a bordo, a partir de este momento puedes ingresar a tu cuenta en el siguiente link:</p>" +
                @$"<p><a href=""{origin}"">{origin}</a></p>" +
                "<p><strong>No olvides que el usuario para ingresar es tu correo electrónico y la contraseña temporal es la siguiente:</strong></p>" +
                @$"<div style=""width:60%;margin:0 auto;""><p style=""background-color:#eeeeee;border-radius:10px;padding:25px;text-align:center;"">{accountPsw}</p></div>" +
                "<p><em>Tienes 1 día para ingresar y cambiar la contraseña temporal por una nueva, de lo contrario, tu cuenta quedará inactiva.</em></p>" +
                @"<p style=""margin-top:85px""><em>""No intentes ser el mejor de tu equipo, intenta que tu equipo sea el mejor"".</em></p><p>Equipo de Que Detallito.</p></div>";

            await _emailService.Send(
                to: account.Email,
                subject: "Bienvenid@ a Que Detallito",
                html: message);
        }

        private async Task SendResetPasswordEmail(AccountModel account, string accountPsw, string origin)
        {
            if (string.IsNullOrEmpty(origin))
            {
                origin = "https://admin.quedetallito.com";
            }

            string message = @"<div style=""font-family:'Helvetica Neue',sans-serif"">" +
                @"<h1 style=""color:#9c27b0;margin-bottom:5px;"">Que Detallito Admin</h1>" +
                @"<p style=""margin:0""><em>Donde tus regalos se vuelven grandes</em></p><br>" +
                $"<h3>¡Hola {account.Name}, vaya al parecer olvidaste tu contraseña!</h3><br>" +
                "<p>Tranquil@, lo tenemos todo cubierto, hemos generado una nueva contraseña para que puedas entrar nuevamente:</p>" +
                @$"<div style=""width:60%;margin:0 auto;""><p style=""background-color:#eeeeee;border-radius:10px;padding:25px;text-align:center;"">{accountPsw}</p></div>" +
                "<p><em>Tienes 1 día para ingresar y cambiar la contraseña temporal por una nueva, de lo contrario, tu cuenta quedará inactiva.</em></p>" +
                @$"<p><a href=""{origin}"">{origin}</a></p>" +
                @"<p style=""margin-top:85px"">Equipo de Que Detallito.</div>";

            await _emailService.Send(
                to: account.Email,
                subject: "Restablecer contraseña de Que Detallito Admin",
                html: message);
        }
    }
}
