namespace FlipMemo.DTOs.External;

public class TextTranslationRequestDto
{
    public List<string> Q { get; set; }
    public string Source { get; set; }
    public string Target { get; set; }
}