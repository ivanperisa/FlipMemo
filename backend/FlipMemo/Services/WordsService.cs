using FlipMemo.Data;
using FlipMemo.DTOs.External;
using FlipMemo.Interfaces;
using FlipMemo.Interfaces.External;
using FlipMemo.Models;

namespace FlipMemo.Services;

public class WordsService(ApplicationDbContext context, IWordsApiService wordsApiService, IDeepTranslateApiService deepTranslateApiService) : IWordsService
{
    public async Task<GetWordResponseDto> GetWordAsync(GetWordRequestDto dto)
    {
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
        await context.SaveChangesAsync();

        return new GetWordResponseDto
        {
            Word = dto.Word,
            Phrases = wordExamplesDto.Examples,
            TranslatedWord = textTranslationResponseDto.TranslatedText[0],
            TranslatedPhrases = [.. textTranslationResponseDto.TranslatedText.Skip(1)]
        };
    }
}