using FlipMemo.DTOs.External;

namespace FlipMemo.Interfaces.External;

public interface IWordsApiService
{
    Task<SearchWordsResponseDto> SearchWordsAsync(string startingLetters);
}
