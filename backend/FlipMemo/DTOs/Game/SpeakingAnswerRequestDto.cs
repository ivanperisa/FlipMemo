namespace FlipMemo.DTOs.Game;

public class SpeakingAnswerRequestDto
{
    public int UserId { get; set; }
    public int WordId { get; set; }
    public int DictionaryId { get; set; }
    public string? RecognizedText { get; set; }
}
