using FlipMemo.DTOs.External;

namespace FlipMemo.Interfaces;

public interface IWordsService
{
    Task<CreateWordResponseDto> CreateWordAsync(int DictionaryId, CreateWordRequestDto dto);
}