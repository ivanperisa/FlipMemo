using FlipMemo.DTOs;

namespace FlipMemo.Interfaces;

public interface IGameService
{
    Task<StartGameResponseDto> GetQuestionAsync(StartGameRequestDto dto);
    Task CheckChoiceAsync(GameAnswerDto dto);
}