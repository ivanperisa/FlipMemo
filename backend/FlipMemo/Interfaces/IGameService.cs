using FlipMemo.DTOs.Game;

namespace FlipMemo.Interfaces;

public interface IGameService
{
    Task<StartGameResponseDto> GetQuestionAsync(StartGameRequestDto dto);
    Task<GameAnswerResponseDto> CheckChoiceAsync(GameAnswerDto dto);

    Task<ListeningQuestionResponseDto> GetListeningQuestionAsync(StartGameRequestDto dto);
    Task<ListeningAnswerResponseDto> CheckListeningAnswerAsync(ListeningAnswerDto dto);

    Task<SpeakingQuestionResponseDto> GetSpeakingQuestionAsync(StartGameRequestDto dto);
    Task<SpeakingAnswerResponseDto> CheckSpeakingAnswerAsync(SpeakingAnswerDto dto);
}