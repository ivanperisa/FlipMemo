using FlipMemo.DTOs;

namespace FlipMemo.Interfaces;

public interface IUserService

{
    
    Task<IEnumerable<GetAllUsersResponseDto>> GetAllUsersAsync();
    Task<UserResponseDto> GetUserByIdAsync(int id);
    Task DeleteUserAsync(int id);
    Task ChangeRole(int id, string operation);
}
