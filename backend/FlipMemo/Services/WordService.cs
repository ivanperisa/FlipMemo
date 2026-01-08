using FlipMemo.Data;
using FlipMemo.DTOs.External;
using FlipMemo.Interfaces;
using FlipMemo.Interfaces.External;
using FlipMemo.Models;
using FlipMemo.Utils;
using Microsoft.EntityFrameworkCore;

namespace FlipMemo.Services;

public class WordService(ApplicationDbContext context, IWordDictionaryApiService wordsApiService, IDeepTranslateApiService deepTranslateApiService) : IWordService
{
    public async Task<CreateWordResponseDto> CreateWordAsync(CreateWordRequestDto dto)
    {
        var dictionaries = await context.Dictionaries
            .Include(d => d.Words)
            .Where(d => dto.DictionaryIds.Contains(d.Id))
            .ToListAsync();

        if (dictionaries.Count != dto.DictionaryIds.Count)
            throw new NotFoundException("One or more dictionaries do not exist.");

        if (dictionaries.Any(d => d.Words.Any(w => w.SourceWord.Equals(dto.Word, StringComparison.OrdinalIgnoreCase))))
            throw new ConflictException("Answer already exists in the dictionary.");

        var wordExamplesDto = await wordsApiService.GetWordExamplesAsync(dto.Word);

        var wordAndPhrasesForTranslation = new List<string>() { dto.Word };
        wordAndPhrasesForTranslation.AddRange(wordExamplesDto.Example);

        var textTranslationRequestDto = new TextTranslationRequestDto
        {
            Q = wordAndPhrasesForTranslation,
            Source = dto.SourceLanguage,
            Target = dto.TargetLanguage
        };

        var textTranslationResponseDto = await deepTranslateApiService.GetTranslationAsync(textTranslationRequestDto);

        var word = new Word
        {
            SourceWord = dto.Word,
            SourcePhrases = wordExamplesDto.Example,
            TargetWord = textTranslationResponseDto.TranslatedText[0],
            TargetPhrases = [.. textTranslationResponseDto.TranslatedText.Skip(1)]
        };

        context.Words.Add(word);
        foreach (var dictionary in dictionaries)
            dictionary.Words.Add(word);

        await context.SaveChangesAsync();

        foreach(var dictionaryId in dto.DictionaryIds)
        {
            var List = new List<UserWord>();
            var Users = await context.UserWords
            .Where(uw => uw.DictionaryId == dictionaryId)
            .Select(uw => uw.UserId)
            .Distinct()
            .ToListAsync();

            foreach(var userId in Users)
            {
                var exist = await context.UserWords
                .Where(uw => uw.UserId == userId && uw.WordId == word.Id)
                .AnyAsync();
                if (!exist)
                    List.Add(new UserWord
                    {
                        UserId = userId,
                        DictionaryId = dictionaryId,
                        WordId = word.Id,
                    });
                context.UserWords.AddRange(List);
            }
        }

        await context.SaveChangesAsync();

        return new CreateWordResponseDto
        {
            Word = dto.Word,
            Phrases = wordExamplesDto.Example,
            TranslatedWord = textTranslationResponseDto.TranslatedText[0],
            TranslatedPhrases = [.. textTranslationResponseDto.TranslatedText.Skip(1)]
        };
    }
}