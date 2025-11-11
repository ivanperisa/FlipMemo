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

    [HttpPost("{dictionaryId}")]
    public async Task<IActionResult> CreateWord(int dictionaryId, [FromBody] CreateWordRequestDto dto)
    {
        var response = await wordsService.CreateWordAsync(dictionaryId, dto);

        return Ok(response);
    }
}