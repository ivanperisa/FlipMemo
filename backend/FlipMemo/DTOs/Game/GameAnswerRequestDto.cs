using FlipMemo.Utils;

namespace FlipMemo.DTOs.Game;

public class GameAnswerRequestDto
{
    public int UserId { get; set; }
	public int DictionaryId { get; set; }
	public int QuestionWordId { get; set; }
	public int ChosenWordId { get; set; }
	public GameModes Mode { get; set; }
}