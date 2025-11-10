using FlipMemo.DTOs.External;
using FlipMemo.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace FlipMemo.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class WordsController(IWordsService wordsService) : ControllerBase
{
    [HttpPost("{dictionaryId}")]
    public async Task<IActionResult> CreateWord(int dictionaryId, [FromBody] CreateWordRequestDto dto)
    {
        var response = await wordsService.CreateWordAsync(dictionaryId, dto);
        return Ok(response);
    }
}