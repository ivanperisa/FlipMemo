namespace FlipMemo.DTOs.UserAndAuth.Login;

public class GoogleLoginResponseDto
{
    public int Id { get; set; }
    public string Email { get; set; } = null!;
    public string Role { get; set; } = null!;
    public string Token { get; set; } = null!;
}
