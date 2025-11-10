using FlipMemo.DTOs.External;
using FlipMemo.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace FlipMemo.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class WordsController(IWordsService wordsService) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> GetWord(GetWordRequestDto dto)
    {
        var response = await wordsService.GetWordAsync(dto);
        return Ok(response);
    }
}