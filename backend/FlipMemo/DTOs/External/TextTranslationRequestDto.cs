namespace FlipMemo.DTOs.External;

public class TextTranslationRequestDto
{
    public List<string> Q { get; set; } = null!;
    public string Source { get; set; } = null!;
    public string Target { get; set; } = null!;
}