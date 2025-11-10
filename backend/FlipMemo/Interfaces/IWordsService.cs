using FlipMemo.DTOs.External;

namespace FlipMemo.Interfaces;

public interface IWordsService
{
    Task<GetWordResponseDto> GetWordAsync(GetWordRequestDto dto);
}