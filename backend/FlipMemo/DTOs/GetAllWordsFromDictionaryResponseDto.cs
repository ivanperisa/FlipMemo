namespace FlipMemo.DTOs;

public class GetWordsFromDictionaryResponseDto
{
    public List<WordDto> Words { get; set; }
}

public record WordDto
{
    public int Id { get; set; }
    public string SourceWord { get; set; } = null!;
    public List<string>? SourcePhrases { get; set; }
    public string? TargetWord { get; set; }
    public List<string>? TargetPhrases { get; set; }
}
