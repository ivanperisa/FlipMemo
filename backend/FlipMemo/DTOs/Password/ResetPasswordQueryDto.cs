namespace FlipMemo.DTOs.Password;

public class ResetPasswordQueryDto
{
    public string Email { get; set; }
    public string Token { get; set; }
}
