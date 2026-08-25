using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;
using MimeKit.Text;
using QueDetallitoAdmin.Data;

namespace QueDetallitoAdmin.Services
{
    public interface IEmailService
    {
        Task Send(string to, string subject, string html, string from = null);
        Task SendCustomer(string to, string subject, string html, string from = null);
    }
    public class EmailService : IEmailService
    {
        private readonly AppSettings _config;
        public EmailService(IOptions<AppSettings> config)
        {
            _config = config.Value;
        }

        public async Task Send(string to, string subject, string html, string from = null)
        {
            //create message
            var email = new MimeMessage();
            email.From.Add(MailboxAddress.Parse(from ?? _config.EmailFrom));
            email.To.Add(MailboxAddress.Parse(to));
            email.Subject = subject;
            email.Body = new TextPart(TextFormat.Html) { Text = html };

            try
            {
                //send email
                using var smtp = new SmtpClient();
                await smtp.ConnectAsync(_config.SmtpHost, _config.SmtpPort, true);
                await smtp.AuthenticateAsync(_config.SmtpUser, _config.SmtpPass);
                await smtp.SendAsync(email);
                await smtp.DisconnectAsync(true);
            }
            catch (Exception ex)
            {
                throw new AppException(ex.Message);
            }
        }

        public async Task SendCustomer(string to, string subject, string html, string from = null)
        {
            //create message
            var email = new MimeMessage();
            email.From.Add(MailboxAddress.Parse(from ?? _config.EmailFromCustomer));
            email.To.Add(MailboxAddress.Parse(to));
            email.Subject = subject;
            email.Body = new TextPart(TextFormat.Html) { Text = html };

            try
            {
                //send email
                using var smtp = new SmtpClient();
                await smtp.ConnectAsync(_config.SmtpHost, _config.SmtpPort, true);
                await smtp.AuthenticateAsync(_config.SmtpUserCustomer, _config.SmtpPassCustomer);
                await smtp.SendAsync(email);
                await smtp.DisconnectAsync(true);
            }
            catch (Exception ex)
            {
                throw new AppException(ex.Message);
            }
        }
    }
}
