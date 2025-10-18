using System.Net;
using System.Net.Mail;
using FlipMemo.Interfaces;
using Microsoft.Extensions.Options;

namespace FlipMemo.Services;

public class EmailSettings
{
    public string Host { get; set; }
    public int Port { get; set; }
    public string Username { get; set; }
    public string Password { get; set; }
    public string From { get; set; }
}

public class EmailService(IOptions<EmailSettings> settings) : IEmailService
{
    private readonly EmailSettings _settings = settings.Value;

    public async Task SendAsync(string to, string subject, string body)
    {
        using var smtp = new SmtpClient(_settings.Host, _settings.Port)
        {
            Credentials = new NetworkCredential(_settings.Username, _settings.Password),
            EnableSsl = _settings.Port == 587 || _settings.Port == 465
        };

        var mail = new MailMessage(_settings.From, to, subject, body);
        await smtp.SendMailAsync(mail);
    }
}
