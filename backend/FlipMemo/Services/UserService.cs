using FlipMemo.Data;
using FlipMemo.DTOs.UserAndAuth;
using FlipMemo.Interfaces;
using FlipMemo.Utils;
using Microsoft.EntityFrameworkCore;

namespace FlipMemo.Services;

public class UserService(ApplicationDbContext context) : IUserService
{
    public async Task<IEnumerable<UserResponseDto>> GetAllUsersAsync(int id)
    {
        var users = await context.Users
            .Select(u => new UserResponseDto
            {
                Id = u.Id,
                Email = u.Email,
                Role = u.Role
            })
            .Where(u => u.Id !=  id)
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

    public async Task<UserStatsDto> GetUserStats(int id)
    {

        var boxCounts = await context.StudyProgresses
            .Where(sp => sp.UserId == id)
            .GroupBy(sp => sp.Box)
            .ToDictionaryAsync(g => g.Key, g => g.Count());

        var numOfReadyWords = await context.StudyProgresses
            .Where(sp =>
                sp.UserId == id &&
                !sp.Learned &&
                (sp.Box == 0 || (sp.NextReview.HasValue && sp.NextReview <= DateTime.UtcNow)))
            .CountAsync();

        var numOfLearnedWords = await context.StudyProgresses
            .Where(sp => sp.UserId == id && sp.Learned)
            .CountAsync();

        return new UserStatsDto
        {
            FirstBox = boxCounts.GetValueOrDefault(0),
            SecondBox = boxCounts.GetValueOrDefault(1),
            ThirdBox = boxCounts.GetValueOrDefault(2),
            FourthBox = boxCounts.GetValueOrDefault(3),
            Learned = boxCounts.GetValueOrDefault(4),
            ReadyForReview = numOfReadyWords
        };
    }
}
