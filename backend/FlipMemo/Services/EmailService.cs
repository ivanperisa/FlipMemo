using System.Net;
using System.Net.Mail;
using FlipMemo.Interfaces;

namespace FlipMemo.Services;

public class EmailService(IConfiguration config) : IEmailService
{
    public async Task SendAsync(string to, string subject, string body)
    {
        var host = config["Email:Host"];
        var port = int.Parse(config["Email:Port"]!);
        var username = config["Email:Username"];
        var password = config["Email:Password"];
        var from = config["Email:From"];

        using var client = new SmtpClient(host, port)
        {
            Credentials = new NetworkCredential(username, password),
            EnableSsl = true
        };

        var mail = new MailMessage(from!, to, subject, body);
        await client.SendMailAsync(mail);
    }
}
