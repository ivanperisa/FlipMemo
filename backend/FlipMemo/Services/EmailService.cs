using System.Net;
using System.Net.Mail;
using FlipMemo.Interfaces;
using Microsoft.Extensions.Options;

namespace FlipMemo.Services;

public class EmailService(IConfiguration config) : IEmailService
{
    public async Task SendAsync(string to, string subject, string body)
    {
        var host = config["Email:Host"];
        var port = int.Parse(config["Email:Port"] ?? "587");
        var username = config["Email:Username"];
        var password = config["Email:Password"];
        var from = config["Email:From"];

        using var smtp = new SmtpClient(host, port)
        {
            Credentials = string.IsNullOrEmpty(username) 
                ? null : new NetworkCredential(username, password),
            EnableSsl = port == 587 || port == 465
        };

        var mail = new MailMessage(from!, to, subject, body);
        await smtp.SendMailAsync(mail);
    }
}
