using FlipMemo.Data;
using FlipMemo.DTOs;
using FlipMemo.Interfaces;
using FlipMemo.Utils;
using Microsoft.EntityFrameworkCore;
using Dictionary = FlipMemo.Models.Dictionary;

namespace FlipMemo.Services;

public class DictionariesService(ApplicationDbContext context) : IDictionariesService
{
    public async Task CreateDictionaryAsync(CreateDictionaryRequestDto dto)
    {
        var dictionaryExists = await context.Dictionaries.SingleOrDefaultAsync(dictionary => dictionary.Name == dto.Name);

        if (dictionaryExists is not null)
            throw new ConflictException("Dictionary already exists.");

        var dictionary = new Dictionary
        {
            Name = dto.Name,
            Language = dto.Language
        };

        context.Dictionaries.Add(dictionary);
        await context.SaveChangesAsync();
    }
}
