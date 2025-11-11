using FlipMemo.DTOs.External;

namespace FlipMemo.Interfaces;

public interface IWordService
{
    Task<CreateWordResponseDto> CreateWordAsync(CreateWordRequestDto dto);
}