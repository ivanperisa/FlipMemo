namespace FlipMemo.DTOs.UserAndAuth.Login;

public class LoginResponseDto
{
    public int Id { get; set; }
    public string Email { get; set; } = null!;
    public string Role { get; set; } = null!;
    public bool MustChangePassword { get; set; }
    public string Token { get; set; } = null!;
}

