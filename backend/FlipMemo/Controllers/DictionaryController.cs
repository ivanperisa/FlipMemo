using FlipMemo.DTOs.WordAndDictionary;
using FlipMemo.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace FlipMemo.Controllers;

[ApiController]
[Route("api/v1/[Controller]")]
public class DictionaryController(IDictionaryService dictionariesService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAllDictionaries()
    {
        var dictionaries = await dictionariesService.GetAllDictionariesAsync();

        return Ok(dictionaries);
    }

    [HttpGet("{id}/words")]
    public async Task<IActionResult> GetWordsFromDictionary(int id)
    {
        var words = await dictionariesService.GetWordsFromDictionaryAsync(id);

        return Ok(words);
    }

    [HttpGet("{wordId}/usage")]
    public async Task<IActionResult> GetWordUsageInDictionaries(int wordId)
    {
        var usage = await dictionariesService.GetWordUsageInDictionariesAsync(wordId);
        return Ok(usage);
    }

    [HttpPost]
    public async Task<IActionResult> CreateDictionary(CreateDictionaryRequestDto dto)
    {
        await dictionariesService.CreateDictionaryAsync(dto);

        return Ok(new { message = "Dictionary created successfully" });
    }

    [HttpPost("{wordId}")]
    public async Task<IActionResult> AddWordsToDictionaries(int wordId, AddWordToDictionariesRequestDto dto)
    {
        await dictionariesService.AddWordToDictionariesAsync(wordId, dto);
        return Ok(new { message = "Word added to dictionaries successfully" });
    }

    [HttpDelete("{dictionaryId}/{wordId}")]
    public async Task<IActionResult> RemoveWordFromDictionary(int dictionaryId, int wordId)
    {
        await dictionariesService.RemoveWordFromDictionaryAsync(dictionaryId, wordId);
        return Ok(new { message = "Word removed from dictionary successfully" });
    }
}
