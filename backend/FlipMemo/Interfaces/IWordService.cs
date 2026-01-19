using FlipMemo.DTOs.External;
using FlipMemo.DTOs.WordAndDictionary;

namespace FlipMemo.Interfaces;

public interface IWordService
{
    Task<CreateWordResponseDto> CreateWordAsync(CreateWordRequestDto dto);
    Task DeleteWordAsync(int wordId);
    Task<GetAllWordsResponseDto> GetAllWordsAsync();
}