using FlipMemo.Data;
using FlipMemo.DTOs;
using FlipMemo.Interfaces;
using FlipMemo.Models;
using FlipMemo.Utils;
using Google.Apis.Auth;
using Microsoft.EntityFrameworkCore;
using static BCrypt.Net.BCrypt;

namespace FlipMemo.Services;

public class AuthService(ApplicationDbContext context, IEmailService emailService, IJwtService jwtService) : IAuthService
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

        return new UserResponseDto {
            Id = user.Id,
            Email = user.Email,
            Role = user.Role
        };
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
                Role = user.Role,
                MustChangePassword = true,
                Token = token
            };
        
        user.LastLogin = DateTime.UtcNow;
        await context.SaveChangesAsync();

        return new LoginResponseDto
        {
            Id = user.Id,
            Email = user.Email,
            Role = user.Role,
            MustChangePassword = false,
            Token = token
        };
    }

    public async Task<GoogleLoginResponseDto> GoogleLoginAsync(GoogleLoginRequestDto dto) 
    {
        var payload = await GoogleJsonWebSignature.ValidateAsync(dto.GoogleToken);
        var user = await context.Users.SingleOrDefaultAsync(u => u.Email == payload.Email);

        if (user is null)
        {
            var initialPassword = Guid.NewGuid().ToString("N")[..8];

            var hashedPassword = HashPassword(initialPassword);

            user = new User
            {
                Email = payload.Email,
                PasswordHash = hashedPassword,
                CreatedAt = DateTime.UtcNow,
                MustChangePassword = true
            };

            var subject = "FlipMemo - Your New Password";
            var body = $"Hello {payload.Name},\n\n" +
                       $"You usually log in with Google, but we've created a password for you to use FlipMemo directly.\n\n" +
                       $"Your temporary password is: {initialPassword}\n\n" +
                       $"You can use your email and this password to log in to FlipMemo.\n\n" +
                       $"For security, we recommend changing it after your first login.\n" +
                       $"If you did not request this, please ignore this email.";

            await emailService.SendAsync(user.Email, subject, body);

            context.Users.Add(user);
        }

        user.LastLogin = DateTime.UtcNow;

        await context.SaveChangesAsync();

        var JwtToken = jwtService.GenerateToken(user);

        return new GoogleLoginResponseDto
        { 
            Id = user.Id,
            Email = user.Email,
            Role = user.Role,
            Token = JwtToken
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
        user.LastLogin = DateTime.UtcNow;
        user.MustChangePassword = false;
        user.SecurityStamp = Guid.NewGuid().ToString();

        await context.SaveChangesAsync();
    }

    public async Task ForgotPasswordAsync(ForgotPasswordRequestDto dto, string resetUrl, string resetToken)
    {
        var user = await context.Users
            .SingleOrDefaultAsync(u => u.Email == dto.Email);

        if (user == null)
            return;

        user.PasswordResetTokenHash = HashPassword(resetToken);
        user.PasswordResetTokenExpiry = DateTime.UtcNow.AddMinutes(15);

        await context.SaveChangesAsync();

        var subject = "FlipMemo - Password Reset Request";
        var body = $"You have requested to reset your password for FlipMemo.\n\n" +
                   $"To continue please click this : {resetUrl}\n\n" +
                   $"This link won't work in 15 minutes.\n" +
                   $"If you did not request this, please ignore this email.";

        await emailService.SendAsync(user.Email, subject, body);
    }

    public async Task ResetPasswordAsync(ResetPasswordQueryDto queryDto, ResetPasswordBodyDto bodyDto)
    {
        var user = await context.Users
            .SingleOrDefaultAsync(u => u.Email == queryDto.Email)
            ?? throw new NotFoundException("Account doesn't exist");

        if (user.PasswordResetTokenHash == null || user.PasswordResetTokenExpiry == null)
            throw new ValidationException("No password reset request found.");

        if (user.PasswordResetTokenExpiry < DateTime.UtcNow)
            throw new ValidationException("Password reset token has expired.");

        if (!Verify(queryDto.Token, user.PasswordResetTokenHash))
            throw new ValidationException("Invalid reset token");

        if (bodyDto.NewPassword != bodyDto.ConfirmNewPassword)
            throw new ValidationException("New password and confirmation password do not match.");

        if (Verify(bodyDto.NewPassword, user.PasswordHash))
            throw new ValidationException("New password must be different from current password.");

        user.PasswordHash = HashPassword(bodyDto.NewPassword);
        user.PasswordResetTokenHash = null;
        user.PasswordResetTokenExpiry = null;
        user.MustChangePassword = false;
        user.SecurityStamp = Guid.NewGuid().ToString();

        await context.SaveChangesAsync();
    }
}
