using FlipMemo.DTOs;
using FlipMemo.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace FlipMemo.Controllers;

[ApiController]
[Route("api/v1/[Controller]")]
public class DictionariesController(IDictionariesService dictionariesService) : ControllerBase
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

    [HttpPost]
    public async Task<IActionResult> CreateDictionary(CreateDictionaryRequestDto dto)
    {
        await dictionariesService.CreateDictionaryAsync(dto);

        return Ok(new { message = "Dictionary created successfully" });
    }
}
