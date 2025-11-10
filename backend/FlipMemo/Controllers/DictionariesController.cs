using FlipMemo.DTOs;
using FlipMemo.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace FlipMemo.Controllers;

[ApiController]
[Route("api/v1/[Controller]")]
public class DictionariesController(IDictionariesService dictionariesService) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> CreateDictionary(CreateDictionaryRequestDto dto)
    {
        await dictionariesService.CreateDictionaryAsync(dto);

        return Ok(new { message = "Dictionary created successfully" });
    }
}
