namespace FlipMemo.Interfaces.External;

public interface ITextToSpeechApiService
{
    Task<byte[]> GetTextToSpeechAudioAsync(string text, string lang, CancellationToken cancellationToken = default);
}
