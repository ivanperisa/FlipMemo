namespace FlipMemo.Models;

public class User
{
    public int Id { get; set; }
    public string Email { get; set; } = null!;
    public string PasswordHash { get; set; } = null!;
    public string Role { get; set; } = null!;
    public DateTime? LastLogin { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool MustChangePassword { get; set; } = true;
    public string SecurityStamp { get; set; } = Guid.NewGuid().ToString();
    public string? PasswordResetTokenHash { get; set; }
    public DateTime? PasswordResetTokenExpiry { get; set; }

    public ICollection<UserWord> UserWords { get; set; }
    public ICollection<Voice> Voices { get; set; }
}
