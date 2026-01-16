namespace FlipMemo.DTOs.Game;

public class ListeningAnswerDto
{
    public int UserId { get; set; }
    public int DictionaryId { get; set; }
    public int WordId { get; set; }
    public string Answer { get; set; } = null!;
}
