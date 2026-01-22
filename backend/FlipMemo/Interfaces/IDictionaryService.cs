using FlipMemo.DTOs.WordAndDictionary;

namespace FlipMemo.Interfaces;

public interface IDictionaryService
{
    Task<GetAllDictionariesResponseDto> GetAllDictionariesAsync();
    Task<GetWordsFromDictionaryResponseDto> GetWordsFromDictionaryAsync(int DictionaryId);
    Task<GetWordUsageInDictionariesResponseDto> GetWordUsageInDictionariesAsync(int wordId);
    Task CreateDictionaryAsync(CreateDictionaryRequestDto dto);

    Task DeleteDictionaryAsync(int DictionaryId);
    Task AddWordToDictionariesAsync(int wordId, AddWordToDictionariesRequestDto dto);
    Task RemoveWordFromDictionaryAsync(int dictionaryId, int wordId);
}
