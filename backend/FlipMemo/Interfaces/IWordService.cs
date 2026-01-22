using FlipMemo.DTOs.External;
using FlipMemo.DTOs.WordAndDictionary;

namespace FlipMemo.Interfaces;

public interface IWordService
{
    Task<GetAllWordsResponseDto> GetAllWordsAsync();
    Task<CreateWordResponseDto> CreateWordAsync(CreateWordRequestDto dto);
    Task<WordDto> ChangeWordPhrasesAsync(ChangeWordPhrasesDto dto);
    Task DeleteWordAsync(int wordId);
}