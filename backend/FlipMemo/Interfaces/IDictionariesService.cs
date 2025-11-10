using FlipMemo.DTOs;

namespace FlipMemo.Interfaces;

public interface IDictionariesService
{
    Task CreateDictionaryAsync(CreateDictionaryRequestDto dto);
}
