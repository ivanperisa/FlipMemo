using FlipMemo.DTOs.External;

namespace FlipMemo.Interfaces.External;

public interface IWordsApiService
{
    Task<SearchWordsResponseDto> SearchWordsAsync(SearchWordsRequestDto dto);
}
