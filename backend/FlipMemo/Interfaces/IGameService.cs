using FlipMemo.DTOs.Game;

namespace FlipMemo.Interfaces;

public interface IGameService
{
    Task<StartGameResponseDto> GetQuestionAsync(StartGameRequestDto dto);
    Task<GameAnswerResponseDto> CheckChoiceAsync(GameAnswerRequestDto dto);

    Task<ListeningQuestionResponseDto> GetListeningQuestionAsync(StartGameRequestDto dto);
    Task<ListeningAnswerResponseDto> CheckListeningAnswerAsync(ListeningAnswerRequestDto dto);

    Task<SpeakingQuestionResponseDto> GetSpeakingQuestionAsync(StartGameRequestDto dto);
    Task<SpeakingAnswerResponseDto> CheckSpeakingAnswerAsync(SpeakingAnswerRequestDto dto);
}