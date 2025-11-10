using FlipMemo.DTOs.External;
using FlipMemo.Interfaces;
using System.Text.Json;

namespace FlipMemo.Services.External;

public class WordDictionaryApiService(HttpClient httpClient) : IWordDictionaryApiService
{
    public async Task<GetWordExamplesResponseDto> GetWordExamplesAsync(string word)
    {
        var options = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        };

        var response = await httpClient.GetAsync($"example/?entry={word}");
        response.EnsureSuccessStatusCode();

        var json = await response.Content.ReadAsStringAsync();
        var wordExamplesDto = JsonSerializer.Deserialize<GetWordExamplesResponseDto>(json, options);

        if (wordExamplesDto?.Example! != null)
            wordExamplesDto.Example = [.. wordExamplesDto.Example.Take(3)];

        return wordExamplesDto!;
    }
}
