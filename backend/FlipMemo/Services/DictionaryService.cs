using FlipMemo.Data;
using FlipMemo.DTOs.WordAndDictionary;
using FlipMemo.Interfaces;
using FlipMemo.Models;
using FlipMemo.Utils;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;

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
                SourcePhrases = w.SourcePhrases!,
                TargetWord = w.TargetWord!,
                TargetPhrases = w.TargetPhrases!
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

        if (word.Dictionaries.Count == 0)
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

    public async Task DeleteDictionaryAsync(int DictionaryId)
    {
        var dictionary = await context.Dictionaries
           .FindAsync(DictionaryId)
            ?? throw new NotFoundException("Account doesn't exist.");

        var progresses = context.StudyProgresses
         .Where(sp => sp.DictionaryId == DictionaryId);

        context.StudyProgresses.RemoveRange(progresses);
        context.Dictionaries.Remove(dictionary);
        

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

        var newDictionaryIds = new List<int>();

        foreach (var dictionary in dictionaries)
        {
            if (!word.Dictionaries.Contains(dictionary))
            {
                word.Dictionaries.Add(dictionary);
                newDictionaryIds.Add(dictionary.Id);
            }
        }

        await context.SaveChangesAsync();

        if (newDictionaryIds.Count > 0)
        {
            await CreateStudyProgressRecordsAsync(wordId, newDictionaryIds);
        }
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

        var studyProgresses = await context.StudyProgresses
            .Where(sp => sp.DictionaryId == dictionaryId && sp.WordId == wordId)
            .ToListAsync();
        context.StudyProgresses.RemoveRange(studyProgresses);

        await context.SaveChangesAsync();
    }

    private static GameModes[] AllGameModes => GameModesHelper.GetAllGameModes;

    private async Task CreateStudyProgressRecordsAsync(int wordId, List<int> dictionaryIds)
    {
        var allUserIds = await context.Users
            .Select(u => u.Id)
            .ToListAsync();

        if (allUserIds.Count == 0)
            return;

        var desired = allUserIds
            .SelectMany(userId => dictionaryIds.SelectMany(dictId =>
                AllGameModes.Select(mode => new { UserId = userId, DictionaryId = dictId, Mode = mode })))
            .ToList();

        var existing = await context.StudyProgresses
            .Where(sp => sp.WordId == wordId && dictionaryIds.Contains(sp.DictionaryId))
            .Select(sp => new { sp.UserId, sp.DictionaryId, sp.Mode })
            .ToListAsync();

        var existingSet = existing
            .Select(x => (x.UserId, x.DictionaryId, x.Mode))
            .ToHashSet();

        var newRows = desired
            .Where(x => !existingSet.Contains((x.UserId, x.DictionaryId, x.Mode)))
            .Select(x => new StudyProgress
            {
                UserId = x.UserId,
                DictionaryId = x.DictionaryId,
                WordId = wordId,
                Mode = x.Mode,
                Box = 0,
                Learned = false,
                Score = null
            })
            .ToList();

        if (newRows.Count == 0)
            return;

        context.StudyProgresses.AddRange(newRows);
        await context.SaveChangesAsync();
    }
}
