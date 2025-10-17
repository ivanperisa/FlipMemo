using FlipMemo.Data;
using FlipMemo.DTOs;
using FlipMemo.Interfaces;
using FlipMemo.Models;
using FlipMemo.Utils;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using static BCrypt.Net.BCrypt;

namespace FlipMemo.Services;

public class AccountService(ApplicationDbContext context, IEmailService emailService, JwtService jwtService) : IAccountService
{
    public async Task<UserResponseDto> RegisterAsync(RegisterRequestDto dto)
    {
        var userExists = await context.Users
            .FirstOrDefaultAsync(u => u.Email == dto.Email);

        if (userExists != null)
            throw new ConflictException("Account already exists.");

        var initialPassword = Guid.NewGuid().ToString("N")[..8];

        var hashedPassword = HashPassword(initialPassword);

        var user = new User()
        {
            Email = dto.Email,
            PasswordHash = hashedPassword,
            Role = Roles.User,
            CreatedAt = DateTime.UtcNow
        };

        var subject = "FlipMemo - Temporary Password";
        var body = $"Welcome to FlipMemo!\n\n" +
                   $"Your temporary password is: {initialPassword}\n" +
                   $"Please change it after your first login.";

        await emailService.SendAsync(user.Email, subject, body);

        context.Users.Add(user);
        await context.SaveChangesAsync();

        return new UserResponseDto { Id = user.Id, Email = user.Email };
    }

    public async Task<LoginResponseDto> LoginAsync(LoginRequestDto dto)
    {
        var user = await context.Users
            .SingleOrDefaultAsync(u => u.Email == dto.Email)
            ?? throw new NotFoundException("Account doesn't exist.");

        if (!Verify(dto.Password, user.PasswordHash))
            throw new UnauthorizedAccessException("Invalid password.");

        var token = jwtService.GenerateToken(user);

        if (user.MustChangePassword)
            return new LoginResponseDto
            {
                Id = user.Id,
                Email = user.Email,
                Token = token,
                MustChangePassword = true
            };
        
        user.LastLogin = DateTime.UtcNow;
        await context.SaveChangesAsync();

        return new LoginResponseDto
        {
            Id = user.Id,
            Email = user.Email,
            Token = token,
            MustChangePassword = false
        };
    }

    public async Task LogoutAsync(int id)
    {
        var user = await context.Users
            .FindAsync(id)
            ?? throw new NotFoundException("Account doesn't exist.");

        user.SecurityStamp = Guid.NewGuid().ToString();

        await context.SaveChangesAsync();
    }

    public async Task ChangePasswordAsync(int id, ChangePasswordRequestDto dto)
    {
        var user = await context.Users
            .FindAsync(id)
            ?? throw new NotFoundException("Account doesn't exist.");

        if (!Verify(dto.CurrentPassword, user.PasswordHash))
            throw new UnauthorizedAccessException("Invalid current password.");

        if (dto.NewPassword != dto.ConfirmNewPassword)
            throw new ValidationException("New password and confirmation password do not match.");

        if (Verify(dto.NewPassword, user.PasswordHash))
            throw new ValidationException("New password must be different from current password.");

        user.PasswordHash = HashPassword(dto.NewPassword);
        user.MustChangePassword = false;
        user.SecurityStamp = Guid.NewGuid().ToString();

        await context.SaveChangesAsync();
    }

    public async Task ForgotPasswordAsync(ForgotPasswordRequestDto dto)
    {
        var user = await context.Users
            .SingleOrDefaultAsync(u => u.Email == dto.Email);

        if (user == null)
            return;

        var resetToken = GenerateSecureToken();

        user.PasswordResetTokenHash = HashPassword(resetToken);
        user.PasswordResetTokenExpiry = DateTime.UtcNow.AddMinutes(15);

        await context.SaveChangesAsync();

        var subject = "FlipMemo - Password Reset Request";
        var body = $"You have requested to reset your password for FlipMemo.\n\n" +
                   $"Your password reset token is: {resetToken}\n\n" +
                   $"This token will expire in 15 minutes.\n" +
                   $"If you did not request this, please ignore this email.";

        await emailService.SendAsync(user.Email, subject, body);
    }

    public async Task ResetPasswordAsync(ResetPasswordRequestDto dto)
    {
        var user = await context.Users
            .SingleOrDefaultAsync(u => u.Email == dto.Email)
            ?? throw new NotFoundException("Account doesn't exist");

        if (user.PasswordResetTokenHash == null || user.PasswordResetTokenExpiry == null)
            throw new ValidationException("No password reset request found.");

        if (user.PasswordResetTokenExpiry < DateTime.UtcNow)
            throw new ValidationException("Password reset token has expired.");

        if (!Verify(dto.Token, user.PasswordResetTokenHash))
            throw new ValidationException("Invalid reset token");

        if (dto.NewPassword != dto.ConfirmNewPassword)
            throw new ValidationException("New password and confirmation password do not match.");

        if (Verify(dto.NewPassword, user.PasswordHash))
            throw new ValidationException("New password must be different from current password.");

        user.PasswordHash = HashPassword(dto.NewPassword);
        user.PasswordResetTokenHash = null;
        user.PasswordResetTokenExpiry = null;
        user.MustChangePassword = false;
        user.SecurityStamp = Guid.NewGuid().ToString();

        await context.SaveChangesAsync();
    }

    private static string GenerateSecureToken()
    {
        var bytes = new byte[32];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(bytes);
        return Convert.ToBase64String(bytes).Replace("+", "-").Replace("/", "_").Replace("=", "");
    }
}
