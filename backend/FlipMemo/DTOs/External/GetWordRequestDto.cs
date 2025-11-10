namespace FlipMemo.DTOs.External;

public class GetWordRequestDto
{
    public string Word { get; set; }
    public string SourceLanguage { get; set; }
    public string TargetLanguage { get; set; }
}
