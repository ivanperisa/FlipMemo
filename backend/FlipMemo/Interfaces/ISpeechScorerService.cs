namespace FlipMemo.Interfaces;

public interface ISpeechScorerService
{
    Task<int> GetSpeechScoreAsync(string? recognizedText, string expectedText);
}
