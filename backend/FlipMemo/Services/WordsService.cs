using FlipMemo.Data;
using FlipMemo.DTOs.External;
using FlipMemo.Interfaces;
using FlipMemo.Interfaces.External;
using FlipMemo.Models;
using FlipMemo.Utils;
using Microsoft.EntityFrameworkCore;

namespace FlipMemo.Services;

public class WordsService(ApplicationDbContext context, IWordsApiService wordsApiService, IDeepTranslateApiService deepTranslateApiService) : IWordsService
{
    public async Task<CreateWordResponseDto> CreateWordAsync(int DictionaryId, CreateWordRequestDto dto)
    {
        var dictionary = await context.Dictionaries
            .Include(d => d.Words)
            .SingleOrDefaultAsync(d => d.Id == DictionaryId)
            ?? throw new NotFoundException("Dictionary doesn't exist.");

        if (dictionary.Words.Any(w => w.SourceWord.Equals(dto.Word, StringComparison.OrdinalIgnoreCase)))
            throw new ConflictException("Word already exists in the dictionary.");

        var wordExamplesDto = await wordsApiService.GetWordExamplesAsync(dto.Word);

        var wordAndPhrasesForTranslation = new List<string>() { dto.Word };
        wordAndPhrasesForTranslation.AddRange(wordExamplesDto.Examples);

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
            SourcePhrases = wordExamplesDto.Examples,
            TargetWord = textTranslationResponseDto.TranslatedText[0],
            TargetPhrases = [.. textTranslationResponseDto.TranslatedText.Skip(1)]
        };

        context.Words.Add(word);
        dictionary.Words.Add(word);
        await context.SaveChangesAsync();

        return new CreateWordResponseDto
        {
            Word = dto.Word,
            Phrases = wordExamplesDto.Examples,
            TranslatedWord = textTranslationResponseDto.TranslatedText[0],
            TranslatedPhrases = [.. textTranslationResponseDto.TranslatedText.Skip(1)]
        };
    }
}