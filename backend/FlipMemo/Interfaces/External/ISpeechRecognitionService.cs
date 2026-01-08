using FlipMemo.DTOs.Game;

namespace FlipMemo.Interfaces.External;

public interface ISpeechRecognitionService
{
    Task<SpeechRecognitionResult> RecognizeSpeechAsync(byte[] audioFile, string expectedText, string language);
}
