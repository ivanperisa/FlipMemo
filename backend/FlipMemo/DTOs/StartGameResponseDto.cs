namespace FlipMemo.DTOs;

public class StartGameResponseDto
{
    public WordDto? SourceWord {get; set; }
    public List<WordDto>? TargetWords { get; set; }
    public int? CorrectAnswerId { get; set; }
}