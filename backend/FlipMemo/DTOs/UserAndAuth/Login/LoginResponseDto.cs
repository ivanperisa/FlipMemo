namespace FlipMemo.DTOs.UserAndAuth.Login;

public class LoginResponseDto
{
    public int Id { get; set; }
    public string Email { get; set; }
    public string Role { get; set; }
    public bool MustChangePassword { get; set; }
    public string Token { get; set; }
}

