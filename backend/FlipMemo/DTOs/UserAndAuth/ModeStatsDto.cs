using FlipMemo.Utils;

namespace FlipMemo.DTOs.UserAndAuth;

public class ModeStatsDto
{
    public GameModes Mode { get; set; }
    public int Total { get; set; }
    public int FirstBox { get; set; }
    public int SecondBox { get; set; }
    public int ThirdBox { get; set; }
    public int FourthBox { get; set; }
    public int Learned { get; set; }
    public int ReadyForReview { get; set; }
    public int Remaining { get; set; }
}
