using FlipMemo.Data;
using FlipMemo.DTOs;
using FlipMemo.Interfaces;
using FlipMemo.Models;
using FlipMemo.Utils;
using Microsoft.EntityFrameworkCore;
using static BCrypt.Net.BCrypt;

namespace FlipMemo.Services;

public class AccountService(ApplicationDbContext context) : IAccountService
{
    public async Task<UserDto> RegisterAsync(RegisterDto dto)
    {
        var userExists = await context.Users
            .FirstOrDefaultAsync(u => u.Username == dto.Username || u.Email == dto.Email);

        if (userExists != null)
            throw new ConflictException("Account with that username or email already exists.");

        var hashedPassword = HashPassword(dto.Password);

        var user = new User()
        {
            Username = dto.Username,
            Email = dto.Email,
            HashedPassword = hashedPassword,
        };

        context.Users.Add(user);
        await context.SaveChangesAsync();

        return new UserDto
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
        };
    }

    public async Task<UserDto> LoginAsync(LoginDto dto)
    {
        var user = await context.Users
            .FirstOrDefaultAsync(u => u.Username == dto.Username)
            ?? throw new NotFoundException("Account with that username doesn't exist.");

        if (!Verify(dto.Password, user.HashedPassword))
            throw new UnauthorizedAccessException("Invalid password.");

        return new UserDto
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email
        };
    }

    public async Task ChangePasswordAsync(int id, ChangePasswordDto dto)
    {
        var user = await context.Users
            .FindAsync(id)
            ?? throw new NotFoundException("Account doesn't exist.");

        if (!Verify(dto.OldPassword, user.HashedPassword))
            throw new UnauthorizedAccessException("Invalid old password.");

        if (Verify(dto.NewPassword, user.HashedPassword))
            throw new ValidationException("New password must be different from old password.");

        user.HashedPassword = HashPassword(dto.NewPassword);

        await context.SaveChangesAsync();
    }
}
