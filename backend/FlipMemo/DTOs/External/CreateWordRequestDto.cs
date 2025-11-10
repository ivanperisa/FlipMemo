namespace FlipMemo.DTOs.External;

public class CreateWordRequestDto
{
    public string Word { get; set; }
    public string SourceLanguage { get; set; }
    public string TargetLanguage { get; set; }
}
