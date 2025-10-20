namespace FlipMemo.Models;

public class Voice
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int WordId { get; set; }
    public int Score { get; set; }
    public DateTime LastReviewed { get; set; }

    public User User { get; set; }
    public Word Word { get; set; }
}