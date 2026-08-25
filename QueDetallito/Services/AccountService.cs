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
        Task<UserData> GetUserData(int idCustomer);
        Task<object> GetZipCodeData(string zipCode);
        Task<IEnumerable<Deliveries>> GetDeliveries(int idCustomer);
        Task AddDelivery(Deliveries delivery, int idCustomer);
        Task UpdateDelivery(Deliveries delivery, int idCustomer);
        Task DeleteDelivery(int idDelivery, int idCustomer);
        Task UpdatePersonalData(UserData user, int idCustomer);
        Task ResendEmailConfirmation(LoginModel login, string origin);
        Task<UserLogin> ValidateSecureCode(LoginModel login);
        Task SubscribeNewsletter(UserData user);
        Task ContactUs(ContactUs contact);
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
                VerificationToken = RandomSecureCode()
            };

            //save account
            await conn.ExecuteAsync("insert into Sales.Customers values (" +
                "@Name,@LastName,@Email,@Phone,@CountryCode,@Password,@LastAccess,@Created,@Verified,@VerificationToken," +
                "@RefreshToken,@RefreshTokenExpires,@ResetToken,@ResetTokenExpires,@PayUserId,@ChangeEmail)", newCustomer);

            //send email
            await SendSecureCodeEmail(newCustomer, origin);
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

        public async Task<UserData> GetUserData(int idCustomer)
        {
            using var conn = await _context.CreateConnectionAsync();

            var user = await conn.QuerySingleOrDefaultAsync<UserData>("select top 1 name, lastName, email, phone from Sales.Customers " +
                "where id = @idCustomer", new { idCustomer });
            if (user == null)
                throw new AppException("Ocurrió un error al obtener tus datos, favor de intentar más tarde");

            return user;
        }

        public async Task<object> GetZipCodeData(string zipCode)
        {
            using var conn = await _context.CreateConnectionAsync();
            using var httpClient = new HttpClient();

            var zipCodeExist = await conn.QuerySingleOrDefaultAsync<string>("select top 1 zipCode from Market.DeliveryCities " +
                "where zipCode = @zipCode", new { zipCode });
            if (zipCodeExist == null)
                throw new AppException("Lo sentimos, aún no contamos con cobertura en esa zona, verifica las zonas disponibles");

            using var data = await httpClient.GetAsync($"https://api-sepomex.hckdrk.mx/query/info_cp/{zipCode}?type=simplified&token={_config.SepomexApi}");
            var cont = await data.Content.ReadAsStringAsync();
            var finalData = JsonSerializer.Deserialize<object>(cont);

            if (finalData == null)
                throw new AppException("Ocurrió un error al obtener los datos del código postal, favor de intentar más tarde");

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

            await SendSecureCodeEmail(account, origin);
        }

        public async Task<UserLogin> ValidateSecureCode(LoginModel login)
        {
            using var conn = await _context.CreateConnectionAsync();

            var account = await conn.QuerySingleOrDefaultAsync<CustomerModel>("select top 1 * from Sales.Customers where email = @user", new { login.User });
            if (account == null)
                throw new AppException("El correo no está registrado, debes registrarte nuevamente", true);
            else if (account.VerificationToken == null && !account.Verified)
            {
                await conn.ExecuteAsync("delete Sales.Customers where email = @User", new { login.User });
                throw new AppException("Hubo un problema con la verificación de tu correo, vuelve a registrarte", true, true);
            }
            else if (account.VerificationToken != login.SecureCode)
                throw new AppException("El código es incorrecto, verifica e intenta nuevamente");

            //Authentication successful
            var jwtToken = GenerateJwtToken(account);
            var refreshToken = GenerateRefreshToken();
            account.RefreshToken = refreshToken.Token;
            account.RefreshTokenExpires = refreshToken.Expires;
            account.LastAccess = DateTime.Now.ToLocalTime();
            account.Verified = true;
            account.VerificationToken = null;

            //Update DB
            await conn.ExecuteAsync("update Sales.Customers set " +
                "RefreshToken = @RefreshToken, " +
                "RefreshTokenExpires = @RefreshTokenExpires, " +
                "LastAccess = @LastAccess, " +
                "verified = @verified, " +
                "verificationToken = @verificationToken " +
                "where ID = @ID", new { account.RefreshToken, account.RefreshTokenExpires, account.LastAccess, account.Verified, account.VerificationToken, account.ID });

            UserLogin user = new UserLogin
            {
                ID = account.ID,
                Email = account.Email,
                JwtToken = jwtToken,
                RefreshToken = refreshToken.Token
            };
            return await Task.FromResult(user);
        }

        public async Task SubscribeNewsletter(UserData user)
        {
            using var conn = await _context.CreateConnectionAsync();

            var email = await conn.QuerySingleOrDefaultAsync<string>("select top 1 email from Market.Newsletter where email = @email", new { user.Email });
            if (email != null)
                throw new AppException("Tu correo ya está inscrito en nuestro boletín, no es necesario registrarse de nuevo");

            await conn.ExecuteAsync("insert into Market.Newsletter values " +
                "(@email, @today)", new { user.Email, today = DateTime.Now.LocalTime() });
        }

        public async Task ContactUs(ContactUs contact)
        {
            var builder = GetHtmlTemplateString("templates/contact_us.html");
            var notifyBuilder = GetHtmlTemplateString("templates/contact_notify.html");

            //{0} Name
            string message = string.Format(builder.HtmlBody, contact.Name);

            await _emailService.Send(
                to: contact.Email,
                subject: "Comentarios recibidos",
                html: message);

            //{0} Name
            //{1} Email
            //{2} Comment
            string notifyMsg = string.Format(notifyBuilder.HtmlBody, contact.Name, contact.Email, contact.Comment);

            await _emailService.Send(
                to: "contacto@quedetallito.com",
                subject: "Nuevo comentario recibido",
                html: notifyMsg);
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

        private static string RandomSecureCode()
        {
            using var crypto = new RNGCryptoServiceProvider();
            var buffer = new byte[sizeof(ulong)];
            crypto.GetBytes(buffer);
            var num = BitConverter.ToUInt64(buffer, 0);
            var pin = num % 100000000;
            return pin.ToString("D8");
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

        private async Task SendSecureCodeEmail(CustomerModel account, string origin)
        {
            var builder = GetHtmlTemplateString("templates/secure_code.html");

            //{0} Name
            //{1} Secure Code
            string message = string.Format(builder.HtmlBody, account.Name, account.VerificationToken);

            await _emailService.Send(
                to: account.Email,
                subject: "Verificación de correo",
                html: message);
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
            var builder = GetHtmlTemplateString("templates/confirm_email.html");

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
            var builder = GetHtmlTemplateString("templates/forgot_password.html");

            //{0} Verification Url
            string message = string.Format(builder.HtmlBody, verifyUrl);

            await _emailService.Send(
                to: account.Email,
                subject: "Recuperar contraseña",
                html: message);
        }

        private BodyBuilder GetHtmlTemplateString(string path)
        {
            string template = Path.Combine(_env.WebRootPath, path);
            var builder = new BodyBuilder();
            using var stream = System.IO.File.OpenText(template);
            builder.HtmlBody = stream.ReadToEnd();

            return builder;
        }
    }
}
