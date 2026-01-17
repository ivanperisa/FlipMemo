using FlipMemo.DTOs.Game;

namespace FlipMemo.Interfaces.External;

public interface ISpeechScorerService
{
    Task<int> GetSpeechScoreAsync(byte[] audioFile, string expectedText, string language, CancellationToken cancellationToken = default);
}
