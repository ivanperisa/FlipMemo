namespace FlipMemo.Interfaces;

public interface ISpeechScorerService
{
    int GetSpeechScoreAsync(string? recognizedText, string expectedText);
}
