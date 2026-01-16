using FlipMemo.DTOs.Game;
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
        var result = await gameService.CheckChoiceAsync(dto);

        return Ok(result);
    }

    [HttpGet("listening/question")]
    //[Authorize(Policy = "UserOrAdmin")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetListeningQuestion([FromQuery] StartGameRequestDto dto)
    {
        var question = await gameService.GetListeningQuestionAsync(dto);

        Response.Headers.Append("X-Word-Id", question.WordId.ToString());

        return File(question.AudioBytes, "audio/mpeg");
    }

    [HttpPut("listening/check-answer")]
    //[Authorize(Policy = "UserOrAdmin")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> CheckListeningAnswer([FromQuery] ListeningAnswerDto dto)
    {
        var result = await gameService.CheckListeningAnswerAsync(dto);

        return Ok(result);
    }

    [HttpGet("speaking/question")]
    //[Authorize(Policy = "UserOrAdmin")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetSpeakingQuestion([FromQuery] StartGameRequestDto dto)
    {
        var question = await gameService.GetSpeakingQuestionAsync(dto);

        return Ok(question);
    }

    [HttpPut("speaking/check-answer")]
    //[Authorize(Policy = "UserOrAdmin")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> CheckSpeakingAnswer([FromQuery] SpeakingAnswerDto dto)
    {
        var result = await gameService.CheckSpeakingAnswerAsync(dto);

        return Ok(result);
    }
}

