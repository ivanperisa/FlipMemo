namespace FlipMemo.Models;

public class User
{
    public int Id { get; set; }
    public string Email { get; set; } = null!;
    public string HashedPassword { get; set; } = null!;
    public string Role { get; set; } = "User";
    public DateTime? LastLogin { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool MustChangePassword { get; set; }
}
