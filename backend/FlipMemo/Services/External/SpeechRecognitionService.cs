using FlipMemo.DTOs.Game;
using FlipMemo.Interfaces.External;

namespace FlipMemo.Services.External;

public class SpeechRecognitionService : ISpeechRecognitionService
{
    public async Task<SpeechRecognitionResult> RecognizeSpeechAsync(byte[] audioFile, string expectedText, string language)
    {
        return new SpeechRecognitionResult
        {
            Score = 100
        };
    }
}
