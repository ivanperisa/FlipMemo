using FlipMemo.Data;
using FlipMemo.DTOs.External;
using FlipMemo.DTOs.WordAndDictionary;
using FlipMemo.Interfaces;
using FlipMemo.Interfaces.External;
using FlipMemo.Models;
using FlipMemo.Utils;
using Microsoft.EntityFrameworkCore;
using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;

namespace FlipMemo.Services;

public class WordService(
    ApplicationDbContext context,
    IWordDictionaryApiService wordsApiService,
    IDeepTranslateApiService deepTranslateApiService,
    ITextToSpeechApiService textToSpeechApiService) : IWordService
{
    public async Task<GetAllWordsResponseDto> GetAllWordsAsync()
    {
        var words = await context.Words
            .Select(w => new WordDto
            {
                Id = w.Id,
                SourceWord = w.SourceWord,
                SourcePhrases = w.SourcePhrases!,
                TargetWord = w.TargetWord!,
                TargetPhrases = w.TargetPhrases!
            })
            .ToListAsync();

        return new GetAllWordsResponseDto
        {
            Words = words
        };
    }

    public async Task<CreateWordResponseDto> CreateWordAsync(CreateWordRequestDto dto)
    {
        var dictionaries = await context.Dictionaries
            .Where(d => dto.DictionaryIds.Contains(d.Id))
            .ToListAsync();

        var (word, targetDictionaryIds) = await GetOrCreateWordAsync(dto, dictionaries);

        await LinkWordToDictionariesAsync(word, dictionaries, targetDictionaryIds);
        await CreateStudyProgressRecordsAsync(word.Id, targetDictionaryIds);

        return new CreateWordResponseDto
        {
            Word = word.SourceWord,
            Phrases = (word.SourcePhrases ?? []).Take(3).ToList(),
            TranslatedWord = word.TargetWord!,
            TranslatedPhrases = (word.TargetPhrases ?? []).Take(3).ToList()
        };
    }

    public async Task<WordDto> ChangeWordPhrasesAsync(ChangeWordPhrasesDto dto)
    {
        var selectedWord = await context.Words.FindAsync(dto.Id)
                ?? throw new NotFoundException("Word not found");

        selectedWord.SourcePhrases = dto.SourcePhrases;
        selectedWord.TargetPhrases = dto.TargetPhrases;

        await context.SaveChangesAsync();
        return new WordDto
        {
            Id = dto.Id,
            SourceWord = selectedWord.SourceWord,
            TargetWord = selectedWord.TargetWord,
            SourcePhrases = selectedWord.SourcePhrases,
            TargetPhrases = selectedWord.TargetPhrases
        };
    }
    public async Task DeleteWordAsync(int wordId)
    {
        var word = await context.Words
            .Include(w => w.Dictionaries)
            .SingleOrDefaultAsync(w => w.Id == wordId)
            ?? throw new NotFoundException("Word doesn't exist.");

        word.Dictionaries.Clear();

        var studyProgresses = await context.StudyProgresses
            .Where(sp => sp.WordId == wordId)
            .ToListAsync();
        context.StudyProgresses.RemoveRange(studyProgresses);

        context.Words.Remove(word);

        await context.SaveChangesAsync();
    }

    #region Helper Methods

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
        var sourcePhrases = await GetSourcePhrasesAsync(dto);
        var audioFile = await textToSpeechApiService.GetTextToSpeechAudioAsync(dto.Word, dto.SourceLanguage);

        var translationRequest = new TextTranslationRequestDto
        {
            Q = [dto.Word, .. sourcePhrases],
            Source = dto.SourceLanguage,
            Target = dto.TargetLanguage
        };

        var translation = await deepTranslateApiService.GetTranslationAsync(translationRequest);

        var targetWord = translation.TranslatedText?.Count > 0
            ? translation.TranslatedText[0]
            : string.Empty;

        var targetPhrases = translation.TranslatedText?.Skip(1).ToList() ?? [];

        return new Word
        {
            SourceWord = dto.Word,
            SourcePhrases = sourcePhrases,
            TargetWord = targetWord,
            TargetPhrases = targetPhrases,
            AudioFile = audioFile
        };
    }

    private async Task<List<string>> GetSourcePhrasesAsync(CreateWordRequestDto dto)
    {
        if (dto.SourceLanguage.Equals("en", StringComparison.OrdinalIgnoreCase))
        {
            var examples = await wordsApiService.GetWordExamplesAsync(dto.Word);
            return (examples.Example ?? [])
                .Where(x => !string.IsNullOrWhiteSpace(x))
                .Select(x => x.Trim())
                .Distinct()
                .Take(10)
                .ToList();
        }

        var pivotRequest = new TextTranslationRequestDto
        {
            Q = [dto.Word],
            Source = dto.SourceLanguage,
            Target = dto.TargetLanguage
        };

        var pivotTranslation = await deepTranslateApiService.GetTranslationAsync(pivotRequest);
        var pivotWord = pivotTranslation.TranslatedText?.FirstOrDefault()?.Trim();

        if (string.IsNullOrWhiteSpace(pivotWord))
            return [];

        var enExamples = await wordsApiService.GetWordExamplesAsync(pivotWord);

        var enList = (enExamples.Example ?? [])
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Select(x => x.Trim())
            .Distinct()
            .OrderBy(x => x.Length)
            .Take(15)
            .ToList();

        if (enList.Count == 0)
            return [];

        var backRequest = new TextTranslationRequestDto
        {
            Q = enList,
            Source = dto.TargetLanguage,
            Target = dto.SourceLanguage
        };

        var backTranslation = await deepTranslateApiService.GetTranslationAsync(backRequest);

        var backList = (backTranslation.TranslatedText ?? [])
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Select(x => x.Trim())
            .ToList();

        var filtered = backList
            .Where(s => ContainsWord(s, dto.Word))
            .Distinct()
            .Take(10)
            .ToList();

        if (filtered.Count >= 3)
            return filtered;

        var extra = backList
            .Where(s => !filtered.Contains(s))
            .Take(3 - filtered.Count)
            .ToList();

        filtered.AddRange(extra);
        return filtered;
    }

    private static bool ContainsWord(string sentence, string word)
    {
        if (string.IsNullOrWhiteSpace(sentence) || string.IsNullOrWhiteSpace(word))
            return false;

        var sNorm = NormalizeForSearch(sentence);
        var wNorm = NormalizeForSearch(word);

        var pattern = $@"(?<!\p{{L}}){Regex.Escape(wNorm)}(?!\p{{L}})";
        return Regex.IsMatch(sNorm, pattern, RegexOptions.IgnoreCase | RegexOptions.CultureInvariant);
    }

    private static string NormalizeForSearch(string input)
    {
        var formD = input.Normalize(NormalizationForm.FormD);
        var sb = new StringBuilder(formD.Length);

        foreach (var ch in formD)
        {
            var uc = CharUnicodeInfo.GetUnicodeCategory(ch);
            if (uc == UnicodeCategory.NonSpacingMark)
                continue;

            sb.Append(ch);
        }

        return sb.ToString().Normalize(NormalizationForm.FormC);
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

    private static readonly GameModes[] _allGameModes = GameModesHelper.GetAllGameModes;

    private async Task CreateStudyProgressRecordsAsync(int wordId, List<int> dictionaryIds)
    {
        var allUserIds = await context.Users
            .Select(u => u.Id)
            .ToListAsync();

        if (allUserIds.Count == 0)
            return;

        var desired = allUserIds
            .SelectMany(userId => dictionaryIds.SelectMany(dictId =>
                _allGameModes.Select(mode => new { UserId = userId, DictionaryId = dictId, Mode = mode })))
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

    #endregion
}
