using FlipMemo.DTOs;

namespace FlipMemo.Interfaces;

public interface IUserService
{
    Task<IEnumerable<UserResponseDto>> GetAllUsersAsync();
    Task<UserResponseDto> GetUserByIdAsync(int id);
    Task DeleteUserAsync(int id);
}
