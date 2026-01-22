namespace FlipMemo.DTOs.Password;

public class ResetPasswordQueryDto
{
    public string Email { get; set; } = null!;
    public string Token { get; set; } = null!;
}
