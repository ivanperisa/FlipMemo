using FlipMemo.DTOs.WordAndDictionary;

namespace FlipMemo.Interfaces;

public interface IDictionaryService
{
    Task<GetAllDictionariesResponseDto> GetAllDictionariesAsync();
    Task<GetWordsFromDictionaryResponseDto> GetWordsFromDictionaryAsync(int DictionaryId);
    Task CreateDictionaryAsync(CreateDictionaryRequestDto dto);
}
