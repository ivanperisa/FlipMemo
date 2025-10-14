namespace FlipMemo.Models;

public class User
{
    public int Id { get; set; }
    public string Username { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string HashedPassword { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public bool IsFirstLogin { get; set; } = true;
}
