using FlipMemo.DTOs.External;

namespace FlipMemo.Interfaces;

public interface IWordDictionaryApiService
{
    Task<GetWordExamplesResponseDto> GetWordExamplesAsync(string word);
}
