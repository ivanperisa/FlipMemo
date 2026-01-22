using FlipMemo.Utils;

namespace FlipMemo.Models;

public class StudyProgress
{
    public int UserId { get; set; }
    public int WordId { get; set; }
    public int DictionaryId { get; set; }
    public GameModes Mode { get; set; }

    public int Box { get; set; } = 0;
    public DateTime? LastReviewed { get; set; }
    public DateTime? NextReview { get; set; }
    public bool Learned { get; set; } = false;

    public int? Score { get; set; }

    public User User { get; set; } = null!;
    public Word Word { get; set; } = null!;
    public Dictionary Dictionary { get; set; } = null!;
}
