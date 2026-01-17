namespace FlipMemo.DTOs.Game;

public class ListeningAnswerResponseDto
{
    public bool IsCorrect { get; set; }
    public string CorrectAnswer { get; set; } = null!;

    public int Box {  get; set; }
}
