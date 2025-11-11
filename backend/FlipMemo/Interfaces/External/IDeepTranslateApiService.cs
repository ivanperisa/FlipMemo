using FlipMemo.DTOs.External;

namespace FlipMemo.Interfaces.External;

public interface IDeepTranslateApiService
{
    Task<TextTranslationResponseDto> GetTranslationAsync(TextTranslationRequestDto requestDto);
}