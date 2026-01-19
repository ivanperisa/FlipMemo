using FlipMemo.DTOs.External;
using FlipMemo.Interfaces.External;
using System.Text;
using System.Text.Json;

namespace FlipMemo.Services.External;

public class DeepTranslateApiService(HttpClient httpClient) : IDeepTranslateApiService
{
    public async Task<TextTranslationResponseDto> GetTranslationAsync(TextTranslationRequestDto requestDto)
    {
        var options = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };

        var json = JsonSerializer.Serialize(requestDto, options);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        var response = await httpClient.PostAsync("language/translate/v2", content);
        response.EnsureSuccessStatusCode();

        var responseString = await response.Content.ReadAsStringAsync();

        using var document = JsonDocument.Parse(responseString);
        var translatedTextList = document.RootElement
            .GetProperty("data")
            .GetProperty("translations")
            .GetProperty("translatedText")
            .EnumerateArray()
            .Select(x => x.GetString()!)
            .ToList();

        return new TextTranslationResponseDto
        {
            TranslatedText = translatedTextList
        };
    }
}