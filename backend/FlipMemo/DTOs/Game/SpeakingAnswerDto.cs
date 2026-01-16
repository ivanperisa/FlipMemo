namespace FlipMemo.DTOs.Game;

public class SpeakingAnswerDto
{
    public int UserId { get; set; }
    public int WordId { get; set; }
    public int DictionaryId { get; set; }
    public IFormFile AudioFile { get; set; } = null!;
    public string Language { get; set; } = null!;
}
