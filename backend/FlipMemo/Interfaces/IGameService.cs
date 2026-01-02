using FlipMemo.DTOs;
using FlipMemo.Models;

namespace FlipMemo.Interfaces;

public interface IGameService
{
    Task<StartGameResponseDto> Pick4RandomAsync(StartGameRequestDto dto);
    Task CheckAnswerTranslate(GameAnswerDto dto);
    DateTime CalculateNextReview(int box);
    Task ProcessVoiceAnswerAsync(int wordId, int pronunciationScore);

}