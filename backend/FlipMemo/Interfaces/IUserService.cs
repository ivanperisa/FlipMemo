using FlipMemo.DTOs;

namespace FlipMemo.Interfaces;

public interface IUserService
{
    Task<IEnumerable<UserDto>> GetAllUsersAsync();
    Task<UserDto> GetUserByIdAsync(int id);
    Task DeleteUserAsync(int id);
}
