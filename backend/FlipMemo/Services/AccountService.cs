using FlipMemo.Data;
using FlipMemo.DTOs;
using FlipMemo.Interfaces;
using FlipMemo.Models;
using FlipMemo.Utils;
using Microsoft.EntityFrameworkCore;
using static BCrypt.Net.BCrypt;

namespace FlipMemo.Services;

public class AccountService(ApplicationDbContext context, IEmailService emailService) : IAccountService
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
            HashedPassword = hashedPassword,
            CreatedAt = DateTime.UtcNow,
            MustChangePassword = true
        };

        context.Users.Add(user);
        await context.SaveChangesAsync();

        var subject = "Your FlipMemo temporary password";
        var body = $"Welcome to FlipMemo!\n\n" +
                   $"Your temporary password is: {initialPassword}\n" +
                   $"Please change it after your first login.";

        await emailService.SendAsync(user.Email, subject, body);

        return new UserResponseDto
        {
            Id = user.Id,
            Email = user.Email
        };
    }

    public async Task<UserResponseDto> LoginAsync(LoginRequestDto dto)
    {
        var user = await context.Users
            .SingleOrDefaultAsync(u => u.Email == dto.Email)
            ?? throw new NotFoundException("Account doesn't exist.");

        if (!Verify(dto.Password, user.HashedPassword))
            throw new UnauthorizedAccessException("Invalid password.");

        if (user.MustChangePassword)
            throw new ValidationException("Password change required on first login.");
        
        user.LastLogin = DateTime.UtcNow;
        await context.SaveChangesAsync();

        return new UserResponseDto
        {
            Id = user.Id,
            Email = user.Email
        };
    }

    public async Task ChangePasswordAsync(int id, ChangePasswordRequestDto dto)
    {
        var user = await context.Users
            .FindAsync(id)
            ?? throw new NotFoundException("Account doesn't exist.");

        if (!Verify(dto.OldPassword, user.HashedPassword))
            throw new UnauthorizedAccessException("Invalid old password.");

        if (Verify(dto.NewPassword, user.HashedPassword))
            throw new ValidationException("New password must be different from old password.");

        user.HashedPassword = HashPassword(dto.NewPassword);
        user.MustChangePassword = false;

        await context.SaveChangesAsync();
    }
}
