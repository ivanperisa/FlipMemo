using FlipMemo.DTOs.External;
using FlipMemo.DTOs.WordAndDictionary;
using FlipMemo.Interfaces;
using FlipMemo.Interfaces.External;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FlipMemo.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class WordController(IWordService wordsService, IWordsApiService wordsApiService) : ControllerBase
{
    [HttpGet("allWords")]
    [Authorize(Policy = "UserOrAdmin")]
    public async Task<IActionResult> GetAllWords()
    {
        var words = await wordsService.GetAllWordsAsync();
        return Ok(words);
    }

    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> CreateWord([FromBody] CreateWordRequestDto dto)
    {
        var response = await wordsService.CreateWordAsync(dto);

        return Ok(response);
    }
    [HttpPost("changePhrases")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> ChangeWordPrases([FromQuery] ChangeWordPhrasesDto dto)
    {
        var response =  await wordsService.ChangeWordPhrasesAsync(dto);
        return Ok(response);
    }

    [HttpDelete("{wordId}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> DeleteWord(int wordId)
    {
        await wordsService.DeleteWordAsync(wordId);
        return Ok(new { message = "Word deleted successfully." });
    }

    #region External API

    [HttpGet]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> SearchWords([FromQuery] SearchWordsRequestDto dto)
    {
        var words = await wordsApiService.SearchWordsAsync(dto);

        return Ok(words);
    }

    #endregion
}