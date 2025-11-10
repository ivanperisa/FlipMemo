using FlipMemo.DTOs;

namespace FlipMemo.Interfaces;

public interface IDictionariesService
{
    Task<GetAllDictionariesResponseDto> GetAllDictionariesAsync();
    Task<GetWordsFromDictionaryResponseDto> GetWordsFromDictionaryAsync(int DictionaryId);
    Task CreateDictionaryAsync(CreateDictionaryRequestDto dto);
}
