using FlipMemo.DTOs;
using FlipMemo.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FlipMemo.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class GameController(IGameService gameService) : ControllerBase
{
    [HttpGet]
    [Authorize(Policy = "UserOrAdmin")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetWords([FromQuery] StartGameRequestDto dto)
    {
        var words = await gameService.Pick4RandomAsync(dto);
        return Ok(words);
    }

    [HttpPut("CheckAnswerTranslate")]
    [Authorize(Policy = "UserOrAdmin")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> CheckAnswerTranslate([FromQuery] GameAnswerDto dto)
    {
        await gameService.CheckAnswerTranslate(dto);

        return Ok();
    }
}

