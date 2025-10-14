using FlipMemo.DTOs;

namespace FlipMemo.Interfaces;

public interface IAccountService
{
    Task<RegisterResponse> RegisterAsync(RegisterDto dto);
    Task<UserDto> LoginAsync(LoginDto dto);
    Task ChangePasswordAsync(int id, ChangePasswordDto dto);
}
