using FlipMemo.DTOs.UserAndAuth;

namespace FlipMemo.Interfaces;

public interface IUserService
{
    Task<IEnumerable<UserResponseDto>> GetAllUsersAsync(int id);
    Task<UserResponseDto> GetUserByIdAsync(int id);
    Task DeleteUserAsync(int id);
    Task ChangeRole(int id, string operation);
    Task<UserStatsDto> GetUserStats(int id);
}
