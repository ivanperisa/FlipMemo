using FlipMemo.Interfaces.External;
using System.Text;
using System.Text.Json;

namespace FlipMemo.Services.External;

public class TextToSpeechApiService(HttpClient httpClient) : ITextToSpeechApiService
{
    public async Task<byte[]> GetTextToSpeechAudioAsync(string text, string lang)
    {
        var options = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };

        var requestDto = new
        {
            text,
            lang
        };

        var json = JsonSerializer.Serialize(requestDto, options);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        var response = await httpClient.PostAsync("/text-to-speech", content);
        response.EnsureSuccessStatusCode();

        var audioBytes = await response.Content.ReadAsByteArrayAsync();
        return audioBytes;
    }
}
