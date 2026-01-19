using FlipMemo.DTOs.External;
using FlipMemo.Interfaces;
using FlipMemo.Interfaces.External;
using Microsoft.AspNetCore.Mvc;

namespace FlipMemo.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class WordController(IWordService wordsService, IWordsApiService wordsApiService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> SearchWords([FromQuery] SearchWordsRequestDto dto)
    {
        var words = await wordsApiService.SearchWordsAsync(dto.StartingLetters);

        return Ok(words);
    }

    [HttpPost]
    public async Task<IActionResult> CreateWord([FromBody] CreateWordRequestDto dto)
    {
        var response = await wordsService.CreateWordAsync(dto);

        return Ok(response);
    }

    [HttpGet("allWords")]
    public async Task<IActionResult> GetAllWords()
    {
        var words = await wordsService.GetAllWordsAsync();
        return Ok(words);
    }

    [HttpDelete("{wordId}")]
    public async Task<IActionResult> DeleteWord(int wordId)
    {
        await wordsService.DeleteWordAsync(wordId);
        return Ok(new { message = "Word deleted successfully." });
    }
}