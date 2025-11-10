using FlipMemo.DTOs.External;
using FlipMemo.Interfaces;
using System.Text.Json;

namespace FlipMemo.Services.External;

public class WordsApiService(HttpClient httpClient) : IWordsApiService
{
    public async Task<GetWordExamplesResponseDto> GetWordExamplesAsync(string word)
    {
        var options = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        };

        var response = await httpClient.GetAsync($"words/{word}/examples");
        response.EnsureSuccessStatusCode();

        var json = await response.Content.ReadAsStringAsync();
        var wordExamplesDto = JsonSerializer.Deserialize<GetWordExamplesResponseDto>(json, options);

        if (wordExamplesDto?.Examples! != null)
            wordExamplesDto.Examples = [.. wordExamplesDto.Examples.Take(3)];

        return wordExamplesDto!;
    }
}
