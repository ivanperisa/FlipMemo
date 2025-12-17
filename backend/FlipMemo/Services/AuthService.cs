using FlipMemo.Data;
using FlipMemo.DTOs;
using FlipMemo.Interfaces;
using FlipMemo.Models;
using FlipMemo.Utils;
using Google.Apis.Auth;
using Microsoft.EntityFrameworkCore;
using static BCrypt.Net.BCrypt;

namespace FlipMemo.Services;

public class AuthService(ApplicationDbContext context, IEmailService emailService, IJwtService jwtService, IWebHostEnvironment env) : IAuthService
{
    public async Task<UserResponseDto> RegisterAsync(RegisterRequestDto dto)
    {
        var userExists = await context.Users
            .FirstOrDefaultAsync(u => u.Email.Equals(dto.Email, StringComparison.CurrentCultureIgnoreCase));

        var initialPassword = Guid.NewGuid().ToString("N")[..8];
        var hashedPassword = HashPassword(initialPassword);

        if (userExists == null)
        {
            userExists = new User()
            {
                Email = dto.Email.ToLower(),
                Role = Roles.User,
                CreatedAt = DateTime.UtcNow
            };
            context.Users.Add(userExists);
        }
        else if (!userExists.MustChangePassword)
            throw new ConflictException("Account already exists.");

        userExists.PasswordHash = hashedPassword;

        var subject = "FlipMemo - Temporary Password";
        var path = Path.Combine(env.ContentRootPath, "HTML", "RegistrationMail.html");
        var body = await File.ReadAllTextAsync(path);
        body = body.Replace("{initialPassword}", initialPassword);

        await emailService.SendAsync(userExists.Email, subject, body);

        await context.SaveChangesAsync();

        return new UserResponseDto {
            Id = userExists.Id,
            Email = userExists.Email,
            Role = userExists.Role
        };
    }

    public async Task<LoginResponseDto> LoginAsync(LoginRequestDto dto)
    {
        var user = await context.Users
            .SingleOrDefaultAsync(u => u.Email.Equals(dto.Email, StringComparison.CurrentCultureIgnoreCase))
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
        var user = await context.Users.SingleOrDefaultAsync(u => u.Email.Equals(payload.Email, StringComparison.CurrentCultureIgnoreCase));

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
            var path = Path.Combine(env.ContentRootPath, "HTML", "GoogleLoginMail.html");
            var body = await File.ReadAllTextAsync(path);
            body = body.Replace("{name}", payload.Name);
            body = body.Replace("{TemporaryPassword}", initialPassword);

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
            .SingleOrDefaultAsync(u => u.Email.Equals(dto.Email, StringComparison.CurrentCultureIgnoreCase));

        if (user == null)
            return;

        user.PasswordResetTokenHash = HashPassword(resetToken);
        user.PasswordResetTokenExpiry = DateTime.UtcNow.AddMinutes(15);

        await context.SaveChangesAsync();

        var subject = "FlipMemo - Password Reset Request";
        var path = Path.Combine(env.ContentRootPath, "HTML", "ResetPasswordMail.html");
        var body = await File.ReadAllTextAsync(path);
        body = body.Replace("{link}", resetUrl);

        await emailService.SendAsync(user.Email, subject, body);
    }

    public async Task ResetPasswordAsync(ResetPasswordQueryDto queryDto, ResetPasswordBodyDto bodyDto)
    {
        var user = await context.Users
            .SingleOrDefaultAsync(u => u.Email.Equals(queryDto.Email, StringComparison.CurrentCultureIgnoreCase))
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
