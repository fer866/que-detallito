using Microsoft.IdentityModel.Tokens;
using QueDetallito.Data;
using QueDetallito.Entities;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using BC = BCrypt.Net.BCrypt;
using Dapper;
using QueDetallito.Handlers;
using Microsoft.Extensions.Options;
using QueDetallito.Models;
using System.Security.Cryptography;
using System.Net.Http;
using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using System.IO;
using MimeKit;

namespace QueDetallito.Services
{
    public interface IAccountService
    {
        Task<UserLogin> Authenticate(LoginModel login);
        Task<UserLogin> RefreshToken(string token);
        Task RevokeToken(string token);
        Task Register(CustomerRegister customer, string origin);
        Task VerifyEmail(LoginModel login);
        Task ForgotPassword(string email, string origin);
        Task ValidateResetToken(LoginModel login);
        Task ResetPassword(LoginModel login);
        Task ChangePassword(ChangeCustomerData change);
        Task ChangeEmail(ChangeCustomerData change, string origin);
        Task<object> GetZipCodeData(string zipCode);
        Task<IEnumerable<Deliveries>> GetDeliveries(int idCustomer);
        Task AddDelivery(Deliveries delivery, int idCustomer);
        Task UpdateDelivery(Deliveries delivery, int idCustomer);
        Task DeleteDelivery(int idDelivery, int idCustomer);
        Task UpdatePersonalData(UserData user, int idCustomer);
        Task ResendEmailConfirmation(LoginModel login, string origin);
    }

    public class AccountService : IAccountService
    {
        private enum OrderStatus
        {
            Payed = 5,
            Preparation = 6,
            InDelivery = 7
        };
        private readonly AppSettings _config;
        private readonly IDatabaseConnection _context;
        private readonly IEmailService _emailService;
        private readonly IWebHostEnvironment _env;
        public AccountService(IOptions<AppSettings> config, IDatabaseConnection context, IEmailService emailService, IWebHostEnvironment env)
        {
            _config = config.Value;
            _context = context;
            _emailService = emailService;
            _env = env;
        }

        public async Task<UserLogin> Authenticate(LoginModel login)
        {
            using var conn = await _context.CreateConnectionAsync();
            var account = await conn.QueryFirstOrDefaultAsync<CustomerModel>("select top 1 * from Sales.Customers where email = @User", login);

            if (account == null)
                throw new AppException("Ups, el usuario no existe, debes registrarte primero");
            else if (!account.Verified)
                throw new AppException("Aún no verificas tu correo, revisa tu bandeja de tu correo", persist: true, requiresAction: true);
            else if (!BC.Verify(login.Password, account.Password))
                throw new AppException("El correo y contraseña no coinciden, porfavor verifica y vuleve a intentar");

            //Authentication successful
            var jwtToken = GenerateJwtToken(account);
            var refreshToken = GenerateRefreshToken();
            account.RefreshToken = refreshToken.Token;
            account.RefreshTokenExpires = refreshToken.Expires;
            account.LastAccess = DateTime.Now.ToLocalTime();

            //Update DB
            await conn.ExecuteAsync("update Sales.Customers set " +
                "RefreshToken = @RefreshToken, " +
                "RefreshTokenExpires = @RefreshTokenExpires, " +
                "LastAccess = @LastAccess " +
                "where ID = @ID", account);

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
            using var conn = await _context.CreateConnectionAsync();
            await conn.ExecuteAsync("update Sales.Customers set " +
                "RefreshToken = @RefreshToken, " +
                "RefreshTokenExpires = @RefreshTokenExpires " +
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

        public async Task RevokeToken(string token)
        {
            var account = await GetRefreshToken(token);
            account.RefreshToken = null;
            account.RefreshTokenExpires = null;

            using var conn = await _context.CreateConnectionAsync();
            await conn.ExecuteAsync("update Sales.Customers set " +
                "RefreshToken = @RefreshToken, " +
                "RefreshTokenExpires = @RefreshTokenExpires " +
                "where ID = @ID", account);
        }

        public async Task Register(CustomerRegister customer, string origin)
        {
            using var conn = await _context.CreateConnectionAsync();
            //validate email
            var account = await conn.QueryFirstOrDefaultAsync<CustomerModel>("select top 1 * from Sales.Customers where Email = @Email", customer);
            if (account != null)
                throw new AppException($"El correo {customer.Email} ya está registrado, recupera tu contraseña si no la recuerdas");

            var newCustomer = new CustomerModel
            {
                Email = customer.Email,
                Name = customer.Name,
                LastName = customer.LastName,
                Password = BC.HashPassword(customer.Password), //hash password
                Created = DateTime.Now.ToLocalTime(),
                Verified = false,
                VerificationToken = RandomTokenString()
            };

            //save account
            await conn.ExecuteAsync("insert into Sales.Customers values (" +
                "@Name,@LastName,@Email,@Phone,@CountryCode,@Password,@LastAccess,@Created,@Verified,@VerificationToken," +
                "@RefreshToken,@RefreshTokenExpires,@ResetToken,@ResetTokenExpires,@PayUserId,@ChangeEmail)", newCustomer);

            //send email
            await SendVerificationEmail(newCustomer, origin);
        }

        public async Task VerifyEmail(LoginModel login)
        {
            using var conn = await _context.CreateConnectionAsync();
            var account = await conn.QueryFirstOrDefaultAsync<CustomerModel>("select top 1 * from Sales.Customers where VerificationToken = @Token", login);

            if (account == null)
                throw new AppException("Lo sentimos la verificación falló, contáctanos para informarte de la situación");

            account.VerificationToken = null;
            account.Verified = true;
            if (account.ChangeEmail != null)
            {
                account.Email = account.ChangeEmail;
                account.ChangeEmail = null;
            }

            await conn.ExecuteAsync("update Sales.Customers set " +
                "VerificationToken = @VerificationToken, " +
                "Verified = @Verified, " +
                "Email = @Email, " +
                "ChangeEmail = @ChangeEmail " +
                "where ID = @ID", account);
        }

        public async Task ForgotPassword(string email, string origin)
        {
            using var conn = await _context.CreateConnectionAsync();
            var param = new { email = email };
            var account = await conn.QueryFirstOrDefaultAsync<CustomerModel>("select top 1 * from Sales.Customers where Email = @email", param);

            // always return ok response to prevent email enumeration
            if (account == null)
                throw new AppException("El correo no está registrado, regístrate para empezar a enviar detallitos", true);

            //create reset token that expires after 1 day
            account.ResetToken = RandomTokenString();
            account.ResetTokenExpires = DateTime.Now.ToLocalTime().AddDays(1);

            //update account
            await conn.ExecuteAsync("update Sales.Customers set " +
                "ResetToken = @ResetToken, " +
                "ResetTokenExpires = @ResetTokenExpires " +
                "where ID = @ID", account);

            //send email
            await SendPasswordResetEmail(account, origin);
        }

        public async Task ValidateResetToken(LoginModel login)
        {
            using var conn = await _context.CreateConnectionAsync();
            var param = new { token = login.Token, today = DateTime.Now.ToLocalTime() };
            var account = await conn.QueryFirstOrDefaultAsync<CustomerModel>("select top 1 * from Sales.Customers where ResetToken = @token and ResetTokenExpires > @today", param);

            if (account == null)
                throw new AppException("Token Inválido");
        }

        public async Task ResetPassword(LoginModel login)
        {
            using var conn = await _context.CreateConnectionAsync();
            var param = new { token = login.Token, today = DateTime.Now.ToLocalTime() };
            var account = await conn.QueryFirstOrDefaultAsync<CustomerModel>("select top 1 * from Sales.Customers where ResetToken = @token and ResetTokenExpires > @today", param);

            if (account == null)
                throw new AppException("La solicitud no es válida, solicita nuevamente recuperar tu contraseña");

            account.Password = BC.HashPassword(login.Password);
            account.ResetToken = null;
            account.ResetTokenExpires = null;

            //update password and remove reset token
            await conn.ExecuteAsync("update Sales.Customers set " +
                "Password = @Password, " +
                "ResetToken = @ResetToken, " +
                "ResetTokenExpires = @ResetTokenExpires " +
                "where ID = @ID", account);
        }

        public async Task ChangePassword(ChangeCustomerData change)
        {
            using var conn = await _context.CreateConnectionAsync();

            var account = await conn.QuerySingleOrDefaultAsync<CustomerModel>("select top 1 * from Sales.Customers where id = @idCustomer", new { change.IdCustomer });

            if (account == null)
                throw new AppException("Ocurrió un problema al acceder en tu cuenta, intenta más tarde");
            else if (!BC.Verify(change.OldPassword, account.Password))
                throw new AppException("Tu contraseña anterior no es correcta, verifica e intenta nuevamente");

            account.Password = BC.HashPassword(change.Password);

            await conn.ExecuteAsync("update Sales.Customers set password = @password where id = @id", new { account.Password, account.ID });
        }

        public async Task ChangeEmail(ChangeCustomerData change, string origin)
        {
            using var conn = await _context.CreateConnectionAsync();

            var account = await conn.QuerySingleOrDefaultAsync<CustomerModel>("select top 1 * from Sales.Customers where id = @id", new { id = change.IdCustomer });
            if (account == null)
                throw new AppException("Ocurrió un problema al acceder en tu cuenta, intenta más tarde");

            var exist = await conn.QuerySingleOrDefaultAsync<string>("select top 1 email from Sales.Customers where email = @email", new { change.Email });
            if (exist != null)
                throw new AppException("El correo al que intentas cambiar ya está registrado con nosotros, favor de verificar", true);

            account.VerificationToken = RandomTokenString();
            account.Email = change.Email;

            await conn.ExecuteAsync("update Sales.Customers set " +
                "VerificationToken = @VerificationToken, " +
                "ChangeEmail = @email " +
                "where id = @id", new { account.VerificationToken, change.Email, account.ID });

            await SendVerificationEmail(account, origin);
        }

        public async Task<object> GetZipCodeData(string zipCode)
        {
            using var httpClient = new HttpClient();
            using var data = await httpClient.GetAsync($"https://api-sepomex.hckdrk.mx/query/info_cp/{zipCode}?type=simplified");
            var cont = await data.Content.ReadAsStringAsync();
            var finalData = JsonSerializer.Deserialize<object>(cont);

            return finalData;
        }

        public async Task<IEnumerable<Deliveries>> GetDeliveries(int idCustomer)
        {
            using var conn = await _context.CreateConnectionAsync();
            var param = new { id = idCustomer, active = true };
            var deliveries = await conn.QueryAsync<Deliveries>("select * from Sales.CustomerDeliveries where IdCustomer = @id and Active = @active", param);
            
            return deliveries;
        }

        public async Task AddDelivery(Deliveries delivery, int idCustomer)
        {
            using var conn = await _context.CreateConnectionAsync();

            var newDelivery = new DeliveriesModel
            {
                IdCustomer = idCustomer,
                Alias = delivery.Alias,
                NameDelivery = delivery.NameDelivery,
                Phone = delivery.Phone,
                ZipCode = delivery.ZipCode,
                State = delivery.State,
                Suburb = delivery.Suburb,
                Town = delivery.Town,
                Street = delivery.Street,
                Number = delivery.Number,
                Longitude = delivery.Longitude,
                Latitude = delivery.Latitude,
                SpecialAddress = delivery.SpecialAddress,
                Created = DateTime.Now.ToLocalTime(),
                Active = true
            };

            try
            {
                await conn.ExecuteAsync("insert into Sales.CustomerDeliveries values (" +
                                "@IdCustomer,@Alias,@NameDelivery,@Phone,@ZipCode,@Street,@Number,@Suburb,@Town,@State,@Longitude,@Latitude," +
                                "@SpecialAddress,@Created,@Modified,@Active)", newDelivery);
            }
            catch (Exception)
            {
                throw new AppException("No fue posible agregar el lugar de entrega, favor de intentar más tarde");
            }
        }

        public async Task UpdateDelivery(Deliveries delivery, int idCustomer)
        {
            using var conn = await _context.CreateConnectionAsync();
            var updDelivery = new DeliveriesModel
            {
                IdCustomer = idCustomer,
                IdDelivery = delivery.IdDelivery,
                Alias = delivery.Alias,
                NameDelivery = delivery.NameDelivery,
                Phone = delivery.Phone,
                ZipCode = delivery.ZipCode,
                State = delivery.State,
                Town = delivery.Town,
                Suburb = delivery.Suburb,
                Street = delivery.Street,
                Number = delivery.Number,
                Longitude = delivery.Longitude,
                Latitude = delivery.Latitude,
                SpecialAddress = delivery.SpecialAddress,
                Modified = DateTime.Now.ToLocalTime()
            };

            var order = await conn.QuerySingleOrDefaultAsync<Nullable<int>>("select top 1 id from Sales.Orders " +
                "where idDelivery = @idDelivery and idStatus in (@payed,@preparation,@inDelivery)",
                new { delivery.IdDelivery, OrderStatus.Payed, OrderStatus.Preparation, OrderStatus.InDelivery });
            if (order != null)
                throw new AppException("No es posible actualizar la dirección ya que existe una orden en proceso");

            try
            {
                await conn.ExecuteAsync("update Sales.CustomerDeliveries set " +
                    "Alias = @Alias," +
                    "NameDelivery = @NameDelivery," +
                    "Phone = @Phone," +
                    "ZipCode = @ZipCode," +
                    "State = @State," +
                    "Town = @Town," +
                    "Suburb = @Suburb," +
                    "Street = @Street," +
                    "Number = @Number," +
                    "Longitude = @Longitude," +
                    "Latitude = @Latitude," +
                    "SpecialAddress = @SpecialAddress," +
                    "Modified = @Modified " +
                    "where IdCustomer = @IdCustomer and IdDelivery = @IdDelivery", updDelivery);
            }
            catch (Exception)
            {
                throw new AppException("No fue posible actualizar la dirección, favor de intentar más tarde");
            }
        }

        public async Task DeleteDelivery(int idDelivery, int idCustomer)
        {
            using var conn = await _context.CreateConnectionAsync();
            var delDelivery = new DeliveriesModel
            {
                IdDelivery = idDelivery,
                IdCustomer = idCustomer,
                Modified = DateTime.Now.ToLocalTime(),
                Active = false
            };

            var order = await conn.QuerySingleOrDefaultAsync<Nullable<int>>("select top 1 id from Sales.Orders " +
                "where idDelivery = @idDelivery and idStatus in (@payed,@preparation,@inDelivery)",
                new { idDelivery, OrderStatus.Payed, OrderStatus.Preparation, OrderStatus.InDelivery });
            if (order != null)
                throw new AppException("No es posible eliminar la dirección ya que existe una orden en proceso");

            var idOrder = await conn.QuerySingleOrDefaultAsync<Nullable<int>>("select top 1 id from Sales.Orders where idDelivery = @idDelivery", new { idDelivery });

            if (idOrder != null)
            {
                await conn.ExecuteAsync("update Sales.CustomerDeliveries set " +
                    "modified = @Modified, " +
                    "active = @Active " +
                    "where idCustomer = @IdCustomer and idDelivery = @IdDelivery", delDelivery);
            }
            else
                await conn.ExecuteAsync("delete Sales.CustomerDeliveries where idCustomer = @IdCustomer and idDelivery = @IdDelivery", delDelivery);
        }

        public async Task UpdatePersonalData(UserData user, int idCustomer)
        {
            using var conn = await _context.CreateConnectionAsync();

            var param = new
            {
                id = idCustomer,
                user.Name,
                user.LastName,
                user.Phone
            };
            await conn.ExecuteAsync("update Sales.Customers set " +
                "name = @Name, " +
                "lastName = @LastName, " +
                "phone = @Phone " +
                "where id = @id", param);
        }

        public async Task ResendEmailConfirmation(LoginModel login, string origin)
        {
            using var conn = await _context.CreateConnectionAsync();

            var account = await conn.QueryFirstOrDefaultAsync<CustomerModel>("select top 1 * from Sales.Customers where email = @User", new { login.User });
            if (account == null)
                throw new AppException("El correo no está registrado, debes registrarte nuevamente", true, true);
            else if (account.VerificationToken == null && !account.Verified)
            {
                await conn.ExecuteAsync("delete Sales.Customers where email = @User", new { login.User });
                throw new AppException("Hubo un problema con la verificación de tu correo, vuelve a registrarte", true, true);
            }
            else if (account.VerificationToken == null && account.Verified)
                throw new AppException("Tu cuenta ya está verificada, inicia sesión con tus datos", false, true);

            await SendVerificationEmail(account, origin);
        }

        private string GenerateJwtToken(CustomerModel account)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config.Secret));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, account.ID.ToString()),
                new Claim(ClaimTypes.Name, account.Name),
                new Claim("LastName", account.LastName),
                new Claim(ClaimTypes.Email, account.Email),
                new Claim(ClaimTypes.MobilePhone, account.Phone ?? "")
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

        private async Task<CustomerModel> GetRefreshToken(string token)
        {
            using var conn = await _context.CreateConnectionAsync();
            var param = new { token = token };
            var account = await conn.QueryFirstOrDefaultAsync<CustomerModel>("select top 1 * from Sales.Customers where RefreshToken = @token", param);

            if (account == null)
                throw new AppException("Sesión inválida, vuelva a iniciar sesión");

            return account;
        }

        private async Task SendVerificationEmail(CustomerModel account, string origin)
        {
            string verifyUrl;
            if (!string.IsNullOrEmpty(origin))
            {
                verifyUrl = $"{origin}/verify-email?token={account.VerificationToken}";
            }
            else
            {
                verifyUrl = $"https://quedetallito.com/account/verify-email?token={account.VerificationToken}";

            }
            string template = Path.Combine(_env.WebRootPath, "templates/confirm_email.html");
            var builder = new BodyBuilder();
            using var stream = File.OpenText(template);
            builder.HtmlBody = stream.ReadToEnd();

            //{0} Name
            //{1} Verification Url
            string message = string.Format(builder.HtmlBody, account.Name, verifyUrl);

            await _emailService.Send(
                to: account.Email,
                subject: "Verificación de correo",
                html: message);
        }

        private async Task SendPasswordResetEmail(CustomerModel account, string origin)
        {
            string verifyUrl;
            if (!string.IsNullOrEmpty(origin))
            {
                verifyUrl = $"{origin}/verify-email?res=1&token={account.ResetToken}";
            }
            else
            {
                verifyUrl = $"https://quedetallito.com/account/verify-email?res=1&token={account.ResetToken}";
            }
            string template = Path.Combine(_env.WebRootPath, "templates/forgot_password.html");
            var builder = new BodyBuilder();
            using var stream = File.OpenText(template);
            builder.HtmlBody = stream.ReadToEnd();

            //{0} Verification Url
            string message = string.Format(builder.HtmlBody, verifyUrl);

            await _emailService.Send(
                to: account.Email,
                subject: "Recuperar contraseña",
                html: message);
        }
    }
}
