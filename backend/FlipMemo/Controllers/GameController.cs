using FlipMemo.DTOs;
using FlipMemo.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FlipMemo.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class GameController(IGameService gameService) : ControllerBase
{
    [HttpGet("question")]
    //[Authorize(Policy = "UserOrAdmin")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetQuestion([FromQuery] StartGameRequestDto dto)
    {
        var question = await gameService.GetQuestionAsync(dto);

        return Ok(question);
    }

    [HttpPut("check-choice")]
    //[Authorize(Policy = "UserOrAdmin")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> CheckChoice([FromQuery] GameAnswerDto dto)
    {
        await gameService.CheckChoiceAsync(dto);

        return Ok();
    }
}

