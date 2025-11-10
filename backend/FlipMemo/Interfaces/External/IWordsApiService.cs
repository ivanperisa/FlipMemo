using FlipMemo.DTOs.External;

namespace FlipMemo.Interfaces;

public interface IWordsApiService
{
    Task<GetWordExamplesResponseDto> GetWordExamplesAsync(string word);
}
