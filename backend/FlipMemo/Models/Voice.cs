namespace FlipMemo.Models;

public class Voice
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int WordId { get; set; }

    public int SpeakingBox { get; set; } = 0;
    public DateTime? SpeakingLastReviewed { get; set; }
    public DateTime? SpeakingNextReview { get; set; }
    public bool SpeakingLearned { get; set; } = false;
    public int SpeakingScore { get; set; } = 0;

    public int ListeningBox { get; set; } = 0;
    public DateTime? ListeningLastReviewed { get; set; }
    public DateTime? ListeningNextReview { get; set; }
    public bool ListeningLearned { get; set; } = false;

    public User User { get; set; } = null!;
    public Word Word { get; set; } = null!;
}