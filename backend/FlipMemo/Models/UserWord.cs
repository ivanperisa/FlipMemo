namespace FlipMemo.Models;

public class UserWord
{
    public int UserId { get; set; }
    public int WordId { get; set; }
    public int Box { get; set; } = 1;
    public DateTime? LastReviewed { get; set; }
    public DateTime? NextReview { get; set; }
    public bool Learned { get; set; } = false;

    public User User { get; set; } = null!;
    public Word Word { get; set; } = null!;
}
