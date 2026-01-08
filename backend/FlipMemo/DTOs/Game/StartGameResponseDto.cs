using FlipMemo.DTOs.WordAndDictionary;

namespace FlipMemo.DTOs.Game;

public class StartGameResponseDto
{
    public WordDto? SourceWord {get; set; }
    public List<WordDto>? Answers { get; set; }
}