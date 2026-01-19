namespace FlipMemo.DTOs.UserAndAuth;

public class UserResponseDto
{
    public int Id { get; set; }
    public string Email { get; set; } = null!;
    public string Role { get; set; } = null!;
}
