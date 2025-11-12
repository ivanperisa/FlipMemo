using FlipMemo.DTOs;

namespace FlipMemo.Interfaces;

public interface IDictionaryService
{
    Task<GetAllDictionariesResponseDto> GetAllDictionariesAsync();
    Task<GetWordsFromDictionaryResponseDto> GetWordsFromDictionaryAsync(int DictionaryId);
    Task CreateDictionaryAsync(CreateDictionaryRequestDto dto);
}
