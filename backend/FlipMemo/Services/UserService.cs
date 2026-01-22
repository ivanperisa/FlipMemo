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
            .Where(u => u.Id != id)
            .ToListAsync();

        return users;
    }

    public async Task<UserResponseDto> GetUserByIdAsync(int id)
    {
        var user = await context.Users
            .FindAsync(id)
            ?? throw new NotFoundException("Account doesn't exist.");

        return new UserResponseDto
        {
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

    public async Task<UserStatsDto> GetUserStatsAsync(int id)
    {
        var data = await context.StudyProgresses
            .Where(sp => sp.UserId == id)
            .GroupBy(sp => new { sp.Mode, sp.Box })
            .Select(g => new
            {
                g.Key.Mode,
                g.Key.Box,
                FirstBox = g.Count(x => x.Box == 0 && x.LastReviewed.HasValue),
                Count = g.Count(),
                Ready = g.Count(x => !x.Learned && (x.NextReview.HasValue && x.NextReview <= DateTime.UtcNow)),
                Learned = g.Count(x => x.Learned)
            })
            .ToListAsync();

        var result = data
            .GroupBy(x => x.Mode)
            .Select(modeGroup =>
            {
                var total = modeGroup.Sum(x => x.Count);
                var learned = modeGroup.Sum(x => x.Learned);

                return new ModeStatsDto
                {
                    Mode = modeGroup.Key,
                    FirstBox = modeGroup.Sum(x => x.FirstBox),
                    SecondBox = modeGroup.FirstOrDefault(x => x.Box == 1)?.Count ?? 0,
                    ThirdBox = modeGroup.FirstOrDefault(x => x.Box == 2)?.Count ?? 0,
                    FourthBox = modeGroup?.FirstOrDefault(x => x.Box == 3)?.Count ?? 0,
                    Learned = learned,
                    ReadyForReview = modeGroup!.Sum(x => x.Ready),
                    Total = total,
                    Remaining = total - learned
                };
            })
            .ToList();

        return new UserStatsDto
        {
            UserStats = result
        };
    }
}
