using FlipMemo.Data;
using FlipMemo.Interfaces;
using FlipMemo.Utils;
using Microsoft.EntityFrameworkCore;
using FlipMemo.Models;
using FlipMemo.DTOs.WordAndDictionary;

namespace FlipMemo.Services;

public class DictionaryService(ApplicationDbContext context) : IDictionaryService
{
    public async Task<GetAllDictionariesResponseDto> GetAllDictionariesAsync()
    {
        var dictionaries = await context.Dictionaries
            .Select(d => new DictionaryDto
            {
                Id = d.Id,
                Name = d.Name,
                Language = d.Language
            })
            .ToListAsync();

        return new GetAllDictionariesResponseDto
        {
            Dictionaries = dictionaries
        };
    }

    public async Task<GetWordsFromDictionaryResponseDto> GetWordsFromDictionaryAsync(int DictionaryId)
    {
        var dictionary = await context.Dictionaries
            .Include(d => d.Words)
            .SingleOrDefaultAsync(d => d.Id == DictionaryId)
            ?? throw new NotFoundException("Dictionary doesn't exist.");

        if (!dictionary.Words.Any())
            throw new NotFoundException("Dictionary doesn't have any words.");

        var words = new List<WordDto>();

        foreach (var w in dictionary.Words)
        {
            words.Add(new WordDto
            {
                Id = w.Id,
                SourceWord = w.SourceWord,
                SourcePhrases = w.SourcePhrases,
                TargetWord = w.TargetWord,
                TargetPhrases = w.TargetPhrases
            });
        }

        return new GetWordsFromDictionaryResponseDto
        {
            Words = words
        };
    }

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
