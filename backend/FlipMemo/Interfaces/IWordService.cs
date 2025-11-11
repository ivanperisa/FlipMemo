using FlipMemo.DTOs.External;

namespace FlipMemo.Interfaces;

public interface IWordService
{
    Task<CreateWordResponseDto> CreateWordAsync(int DictionaryId, CreateWordRequestDto dto);
}