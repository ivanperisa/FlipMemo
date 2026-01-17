using FlipMemo.Data;
using FlipMemo.DTOs.External;
using FlipMemo.Interfaces;
using FlipMemo.Interfaces.External;
using FlipMemo.Models;
using FlipMemo.Utils;
using Microsoft.EntityFrameworkCore;

namespace FlipMemo.Services;

public class WordService(
    ApplicationDbContext context,
    IWordDictionaryApiService wordsApiService,
    IDeepTranslateApiService deepTranslateApiService) : IWordService
{
    public async Task<CreateWordResponseDto> CreateWordAsync(CreateWordRequestDto dto)
    {
        var dictionaries = await GetAndValidateDictionariesAsync(dto.DictionaryIds);
        var (word, targetDictionaryIds) = await GetOrCreateWordAsync(dto, dictionaries);

        await LinkWordToDictionariesAsync(word, dictionaries, targetDictionaryIds);
        await CreateUserProgressRecordsAsync(word.Id, targetDictionaryIds);

        return new CreateWordResponseDto
        {
            Word = word.SourceWord,
            Phrases = word.SourcePhrases!,
            TranslatedWord = word.TargetWord!,
            TranslatedPhrases = word.TargetPhrases!
        };
    }

    private async Task<List<Dictionary>> GetAndValidateDictionariesAsync(List<int> dictionaryIds)
    {
        var dictionaries = await context.Dictionaries
            .Where(d => dictionaryIds.Contains(d.Id))
            .ToListAsync();

        if (dictionaries.Count != dictionaryIds.Count)
            throw new NotFoundException("One or more dictionaries do not exist.");

        return dictionaries;
    }

    private async Task<(Word word, List<int> targetDictionaryIds)> GetOrCreateWordAsync(
        CreateWordRequestDto dto,
        List<Dictionary> dictionaries)
    {
        var existingWord = await context.Words
            .Where(w => w.SourceWord.ToLower() == dto.Word.ToLower())
            .Select(w => new { Word = w, DictionaryIds = w.Dictionaries.Select(d => d.Id).ToList() })
            .FirstOrDefaultAsync();

        if (existingWord != null)
        {
            var newDictionaryIds = dto.DictionaryIds.Except(existingWord.DictionaryIds).ToList();

            if (newDictionaryIds.Count == 0)
            {
                var names = string.Join(", ", dictionaries.Select(d => d.Name));
                throw new ConflictException($"Word already exists in all specified dictionaries: {names}");
            }

            return (existingWord.Word, newDictionaryIds);
        }

        var word = await CreateNewWordAsync(dto);
        context.Words.Add(word);

        return (word, dto.DictionaryIds);
    }

    private async Task<Word> CreateNewWordAsync(CreateWordRequestDto dto)
    {
        var examples = await wordsApiService.GetWordExamplesAsync(dto.Word);

        var translationRequest = new TextTranslationRequestDto
        {
            Q = [dto.Word, .. examples.Example],
            Source = dto.SourceLanguage,
            Target = dto.TargetLanguage
        };

        var translation = await deepTranslateApiService.GetTranslationAsync(translationRequest);

        return new Word
        {
            SourceWord = dto.Word,
            SourcePhrases = examples.Example,
            TargetWord = translation.TranslatedText[0],
            TargetPhrases = [.. translation.TranslatedText.Skip(1)]
        };
    }

    private async Task LinkWordToDictionariesAsync(
        Word word,
        List<Dictionary> dictionaries,
        List<int> targetDictionaryIds)
    {
        var dictionariesToUpdate = dictionaries
            .Where(d => targetDictionaryIds.Contains(d.Id));

        foreach (var dictionary in dictionariesToUpdate)
            dictionary.Words.Add(word);

        await context.SaveChangesAsync();
    }

    private async Task CreateUserProgressRecordsAsync(int wordId, List<int> dictionaryIds)
    {
        var allUserIds = await context.Users
            .Select(u => u.Id)
            .ToListAsync();

        if (allUserIds.Count == 0)
            return;

        var userDictionaryCombinations = allUserIds
            .SelectMany(userId => dictionaryIds.Select(dictId => new { UserId = userId, DictionaryId = dictId }))
            .ToList();

        var existingUserWords = await context.UserWords
            .Where(uw => uw.WordId == wordId)
            .Select(uw => new { uw.UserId, uw.DictionaryId })
            .ToListAsync();

        var existingVoices = await context.Voices
            .Where(v => v.WordId == wordId)
            .Select(v => new { v.UserId, v.DictionaryId })
            .ToListAsync();

        var newUserWords = userDictionaryCombinations
            .Except(existingUserWords)
            .Select(x => new UserWord { UserId = x.UserId, DictionaryId = x.DictionaryId, WordId = wordId });

        var newVoices = userDictionaryCombinations
            .Except(existingVoices)
            .Select(x => new Voice { UserId = x.UserId, DictionaryId = x.DictionaryId, WordId = wordId });

        context.UserWords.AddRange(newUserWords);
        context.Voices.AddRange(newVoices);

        await context.SaveChangesAsync();
    }
}