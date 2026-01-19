namespace FlipMemo.DTOs.External;

public class SearchWordsRequestDto
{
    public string StartingLetters { get; set; } = null!;
    public string Language { get; set; } = null!;
}
