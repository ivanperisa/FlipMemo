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

        if (dictionary.Words.Count == 0)
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

    public async Task<GetWordUsageInDictionariesResponseDto> GetWordUsageInDictionariesAsync(int wordId)
    {
        var word = await context.Words
            .Include(w => w.Dictionaries)
            .SingleOrDefaultAsync(w => w.Id == wordId)
            ?? throw new NotFoundException("Word doesn't exist.");

        if (!word.Dictionaries.Any())
            throw new NotFoundException("Word is not used in any dictionaries.");

        var dictionaries = word.Dictionaries
            .Select(d => new WordDictionaryUsageDto
            {
                DictionaryId = d.Id,
                DictionaryName = d.Name
            })
            .ToList();

        return new GetWordUsageInDictionariesResponseDto
        {
            Dictionaries = dictionaries
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

    public async Task AddWordToDictionariesAsync(int wordId, AddWordToDictionariesRequestDto dto)
    {
        var word = await context.Words
            .Include(w => w.Dictionaries)
            .SingleOrDefaultAsync(w => w.Id == wordId)
            ?? throw new NotFoundException("Word doesn't exist.");

        var dictionaries = await context.Dictionaries
            .Where(d => dto.DictionaryIds.Contains(d.Id))
            .ToListAsync();

        if (dictionaries.Count != dto.DictionaryIds.Count)
            throw new NotFoundException("One or more specified dictionaries don't exist.");

        foreach (var dictionary in dictionaries)
        {
            if (!word.Dictionaries.Contains(dictionary))
            {
                word.Dictionaries.Add(dictionary);
            }
        }

        await context.SaveChangesAsync();
    }

    public async Task RemoveWordFromDictionaryAsync(int dictionaryId, int wordId)
    {
        var dictionary = await context.Dictionaries
            .Include(d => d.Words)
            .SingleOrDefaultAsync(d => d.Id == dictionaryId)
            ?? throw new NotFoundException("Dictionary doesn't exist.");
        var word = await context.Words
            .SingleOrDefaultAsync(w => w.Id == wordId)
            ?? throw new NotFoundException("Word doesn't exist.");
        if (!dictionary.Words.Contains(word))
            throw new NotFoundException("The dictionary doesn't contain the specified word.");
        dictionary.Words.Remove(word);
        await context.SaveChangesAsync();
    }
}
