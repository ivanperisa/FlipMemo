namespace FlipMemo.DTOs.External;

public class GetWordResponseDto
{
    public string Word { get; set; }
    public List<string> Phrases { get; set; }
    public string TranslatedWord { get; set; }
    public List<string> TranslatedPhrases { get; set; }
}