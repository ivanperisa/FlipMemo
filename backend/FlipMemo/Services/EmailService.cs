using FlipMemo.Interfaces;
using FlipMemo.Utils;
using Microsoft.Extensions.Options;
using SendGrid;
using SendGrid.Helpers.Mail;
using System.Net.Mail;

namespace FlipMemo.Services;

public class EmailService(IOptions<EmailSettings> options, ILogger<EmailService> logger) : IEmailService
{
    public async Task SendAsync(string sendingTo, string subject, string? plainText, string? html)
    {
        var emailSettings = options.Value;

        var client = new SendGridClient(emailSettings.SendGridApiKey);
        var from = new EmailAddress(emailSettings.From, emailSettings.Name);
        var to = new EmailAddress(sendingTo);

        var email = MailHelper.CreateSingleEmail(from, to, subject, null , html);

        await client.SendEmailAsync(email);
    }
}
