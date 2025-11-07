using System.Net;
using System.Net.Mail;
using FlipMemo.Interfaces;
using Microsoft.Extensions.Options;

namespace FlipMemo.Services;

public class EmailService(IConfiguration config) : IEmailService
{
    public async Task SendAsync(string to, string subject, string body)
    {

        var host = Environment.GetEnvironmentVariable("Email__Host");
        var port = int.Parse(Environment.GetEnvironmentVariable("Email__Port"));
        var username = Environment.GetEnvironmentVariable("Email__Username");
        var password = Environment.GetEnvironmentVariable("Email__Password");
        var from = Environment.GetEnvironmentVariable("Email__From");

        using var client = new SmtpClient(host, port)
        {
            Credentials = new NetworkCredential(username, password),
            EnableSsl = true
        };

        var message = new MailMessage(from, to, subject, body)
        {
            IsBodyHtml = false
        };

        await client.SendMailAsync(message);

    }
}
