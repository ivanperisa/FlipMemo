using FlipMemo.DTOs;

namespace FlipMemo.Interfaces;

public interface IAccountService
{
    Task<UserResponseDto> RegisterAsync(RegisterRequestDto dto);
    Task<LoginResponseDto> LoginAsync(LoginRequestDto dto);
    Task ChangePasswordAsync(int id, ChangePasswordRequestDto dto);
    Task ForgotPasswordAsync(ForgotPasswordRequestDto dto);
    Task ResetPasswordAsync(ResetPasswordRequestDto dto);
}
