using FlipMemo.Data;
using FlipMemo.DTOs;
using FlipMemo.Interfaces;
using FlipMemo.Utils;
using Microsoft.EntityFrameworkCore;

namespace FlipMemo.Services;

public class UserService(ApplicationDbContext context) : IUserService
{
    public async Task<IEnumerable<UserResponseDto>> GetAllUsersAsync()
    {
        var users = await context.Users
            .Select(u => new UserResponseDto
            {
                Id = u.Id,
                Email = u.Email,
                Role = u.Role
            })
            .ToListAsync();

        return users;
    }

    public async Task<UserResponseDto> GetUserByIdAsync(int id)
    {
        var user = await context.Users
            .FindAsync(id)
            ?? throw new NotFoundException("Account doesn't exist.");

        return new UserResponseDto {
            Id = user.Id,
            Email = user.Email,
            Role = user.Role
        };
    }

    public async Task DeleteUserAsync(int id)
    {
        var user = await context.Users
            .FindAsync(id)
            ?? throw new NotFoundException("Account doesn't exist.");

        context.Users.Remove(user);

        await context.SaveChangesAsync();
    }

    public async Task ChangeRole(int id, string operation)
    {
        var user = await context.Users.
            FindAsync(id)
            ?? throw new NotFoundException("Account doesn't exist.");

        switch (operation)
        {
            case "Promote":
                if (user.Role == Roles.Admin) 
                    throw new ConflictException("This user is already an admin.");
                user.Role = Roles.Admin;
                break;
            case "Demote":
                if (user.Role == Roles.User) 
                    throw new ConflictException("You can only demote admins.");
                user.Role = Roles.User;
                break;
        }
        await context.SaveChangesAsync();
    }
}
