namespace FlipMemo.DTOs.Game;

public class ListeningQuestionResponseDto
{
    public int WordId { get; set; }
    public byte[] AudioBytes { get; set; } = null!;
}
