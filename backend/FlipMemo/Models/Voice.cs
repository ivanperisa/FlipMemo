namespace FlipMemo.Models;

public class Voice
{
    public int Id { get; set; }

    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public int WordId { get; set; }
    public Word Word { get; set; } = null!;

    public int Score { get; set; } //1 do 10
    public DateTime LastReviewed { get; set; }
}
