using FlipMemo.DTOs;
using FlipMemo.Interfaces;
using FlipMemo.Interfaces.External;
using FlipMemo.Services.External;
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

    [HttpPost("CheckAnswerVoice")]
    [Authorize(Policy = "UserOrAdmin")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    [Consumes("multipart/form-data")] //potrebno za prijem filea
    public async Task<IActionResult> CheckAnswerVoice([FromForm] GameAnswerWithVoiceDto dto)
    {
        using var audioStream = dto.AudioFile.OpenReadStream();

        PronunciationScorer PronunciationScorer = new PronunciationScorer();

        int score = await PronunciationScorer.GetPronunciationScoreAsync(audioStream);

        await gameService.ProcessVoiceAnswerAsync(dto.WordId, score);

        return Ok(new { Score = score });

    }
}

