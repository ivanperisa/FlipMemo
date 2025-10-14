using FlipMemo.Data;
using FlipMemo.DTOs;
using FlipMemo.Models;
using Microsoft.EntityFrameworkCore;

namespace FlipMemo.Services;

public class UserService(ApplicationDbContext context)
{
    public async Task<GetUsersResponse> GetUsersAsync()
    {
        var users = await context.Users
            .Select(u => new UserDto
            {
                Id = u.Id,
                Username = u.Username,
                Email = u.Email
            })
            .ToListAsync();

        return new GetUsersResponse { Users = users };
    }

    public async Task<CreateUserResponse> CreateUserAsync(CreateUserRequest request)
    {
        var userExists = context.Users.FirstOrDefault(u => u.Email == request.Email || u.Username == request.Username);

        if (userExists != null)
            throw new Exception("User with that email or username already exists");

        string hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.Password);

        var user = new User
        {
            Username = request.Username,
            Email = request.Email,
            HashedPassword = hashedPassword
        };

        context.Users.Add(user);
        await context.SaveChangesAsync();

        return new CreateUserResponse { IsCreated = true };
    }

    public async Task<LoginUserResponse> LoginUserAsync(LoginUserRequest request)
    {
        var user = await context.Users
            .FirstOrDefaultAsync(u => u.Username == request.Username)
            ?? throw new Exception("User with that username doesn't exist");

        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.HashedPassword))
            throw new Exception("Invalid password");

        return new LoginUserResponse { Success = true };
    }
}
