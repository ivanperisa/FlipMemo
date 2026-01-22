namespace FlipMemo.DTOs.External;

public class CreateWordRequestDto
{
    public List<int> DictionaryIds { get; set; } = null!;
    public string Word { get; set; } = null!;
    public string SourceLanguage { get; set; } = null!;
    public string TargetLanguage { get; set; } = null!;
}