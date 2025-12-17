namespace FlipMemo.DTOs;

public class GameAnswerDto
{
    public int UserId { get; set; }
	public int ChosenWordId { get; set; }
	public int CorrectWordId { get; set; }
}