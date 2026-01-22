using FlipMemo.Utils;

namespace FlipMemo.DTOs.Game;

public class StartGameRequestDto
{
    public int UserId { get; set; }
    public int DictionaryId { get; set; }
    public GameModes Mode { get; set; }
}