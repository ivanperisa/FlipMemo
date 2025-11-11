using FlipMemo.DTOs.External;
using FlipMemo.Interfaces.External;
using System.Text.Json;

namespace FlipMemo.Services.External;

public class WordsApiService(HttpClient httpClient) : IWordsApiService
{
    public async Task<SearchWordsResponseDto> SearchWordsAsync(string startingLetters)
    {
        var options = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };

        var response = await httpClient.GetAsync($"/words/?letterPattern=^{startingLetters}[a-zA-Z]*$&lettersmin=4&limit=10&page=1&frequencymin=5&frequencymax=8");
        response.EnsureSuccessStatusCode();

        var json = await response.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(json);
        var data = doc.RootElement
            .GetProperty("results")
            .GetProperty("data")
            .EnumerateArray()
            .Select(x => x.GetString()!)
            .ToList();

        return new SearchWordsResponseDto
        {
            Words = data
        };
    }
}
