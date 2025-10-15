using FlipMemo.DTOs;

namespace FlipMemo.Interfaces;

public interface IAccountService
{
    Task<RegisterResponseDto> RegisterAsync(RegisterRequestDto dto);
    Task<UserResponseDto> LoginAsync(LoginRequestDto dto);
    Task ChangePasswordAsync(int id, ChangePasswordRequestDto dto);
}
