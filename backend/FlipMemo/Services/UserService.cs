using FlipMemo.Data;
using FlipMemo.DTOs;
using FlipMemo.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FlipMemo.Services;

public class UserService(ApplicationDbContext context) : IUserService
{
    public async Task<IEnumerable<UserDto>> GetAllUsersAsync()
    {
        var users = await context.Users
            .Select(u => new UserDto
            {
                Id = u.Id,
                Username = u.Username,
                Email = u.Email,
            })
            .ToListAsync();

        return users;
    }
    public async Task<UserDto> GetUserByIdAsync(int id)
    {
        var user = await context.Users
            .FindAsync(id)
            ?? throw new InvalidOperationException("Account doesn't exist");

        return new UserDto
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
        };
    }

    public async Task DeleteUserAsync(int id)
    {
        var user = await context.Users
            .FindAsync(id)
            ?? throw new InvalidOperationException("Account doesn't exist");

        context.Users.Remove(user);

        await context.SaveChangesAsync();
    }
}
