using FlipMemo.DTOs.UserAndAuth;

namespace FlipMemo.Interfaces;

public interface IUserService
{
    Task<IEnumerable<UserResponseDto>> GetAllUsersAsync();
    Task<UserResponseDto> GetUserByIdAsync(int id);
    Task DeleteUserAsync(int id);
    Task ChangeRole(int id, string operation);
}
