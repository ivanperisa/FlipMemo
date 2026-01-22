using FlipMemo.DTOs.WordAndDictionary;

namespace FlipMemo.DTOs.Game;

public class StartGameResponseDto
{
    public WordDto SourceWord {get; set; } = null!;
    public List<WordDto> Answers { get; set; } = null!;
}