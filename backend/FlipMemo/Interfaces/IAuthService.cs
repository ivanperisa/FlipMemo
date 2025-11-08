using FlipMemo.DTOs;

namespace FlipMemo.Interfaces;

public interface IAuthService
{
    Task<UserResponseDto> RegisterAsync(RegisterRequestDto dto);
    Task<LoginResponseDto> LoginAsync(LoginRequestDto dto);
    Task<GoogleLoginResponseDto> GoogleLoginAsync(GoogleLoginRequestDto dto);
    Task ChangePasswordAsync(int id, ChangePasswordRequestDto dto);
    Task ForgotPasswordAsync(ForgotPasswordRequestDto dto, string resetUrl, string resetToken);
    Task ResetPasswordAsync(ResetPasswordQueryDto queryDto, ResetPasswordBodyDto bodyDto);
    Task LogoutAsync(int id);
}
