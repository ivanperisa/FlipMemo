using FlipMemo.DTOs.WordAndDictionary;
using FlipMemo.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FlipMemo.Controllers;

[ApiController]
[Route("api/v1/[Controller]")]
public class DictionaryController(IDictionaryService dictionariesService) : ControllerBase
{
    [HttpGet]
    [Authorize(Policy = "UserOrAdmin")]
    public async Task<IActionResult> GetAllDictionaries()
    {
        var dictionaries = await dictionariesService.GetAllDictionariesAsync();

        return Ok(dictionaries);
    }

    [HttpGet("{id}/words")]
    [Authorize(Policy = "UserOrAdmin")]
    public async Task<IActionResult> GetWordsFromDictionary(int id)
    {
        var words = await dictionariesService.GetWordsFromDictionaryAsync(id);

        return Ok(words);
    }

    [HttpGet("{wordId}/usage")]
    [Authorize(Policy = "UserOrAdmin")]
    public async Task<IActionResult> GetWordUsageInDictionaries(int wordId)
    {
        var usage = await dictionariesService.GetWordUsageInDictionariesAsync(wordId);
        return Ok(usage);
    }

    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> CreateDictionary(CreateDictionaryRequestDto dto)
    {
        await dictionariesService.CreateDictionaryAsync(dto);

        return Ok(new { message = "Dictionary created successfully" });
    }

    [HttpPost("{wordId}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> AddWordsToDictionaries(int wordId, AddWordToDictionariesRequestDto dto)
    {
        await dictionariesService.AddWordToDictionariesAsync(wordId, dto);
        return Ok(new { message = "Word added to dictionaries successfully" });
    }

    [HttpDelete("{dictionaryId}/{wordId}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> RemoveWordFromDictionary(int dictionaryId, int wordId)
    {
        await dictionariesService.RemoveWordFromDictionaryAsync(dictionaryId, wordId);
        return Ok(new { message = "Word removed from dictionary successfully" });
    }
}
