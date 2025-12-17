using FlipMemo.Data;
using FlipMemo.DTOs;
using FlipMemo.Interfaces;
using FlipMemo.Models;
using FlipMemo.Utils;
using Microsoft.EntityFrameworkCore;

namespace FlipMemo.Services;

public class GameService(ApplicationDbContext context) : IGameService
{
    private static readonly int[] ReviewIntervals = [2, 4, 6, 8, 16];
    private const int MaxBox = 4;
    private const int AnswerOptionsCount = 3;
    private const int DefaultReviewInterval = 30;

    public async Task<StartGameResponseDto> GetQuestionAsync(StartGameRequestDto dto)
    {
        var dictionary = await context.Dictionaries
            .Include(d => d.Words)
            .SingleOrDefaultAsync(d => d.Id == dto.DictionaryId)
            ?? throw new NotFoundException("Dictionary not found.");

        var userWords = await context.UserWords
            .Where(uw => uw.UserId == dto.UserId && uw.DictionaryId == dto.DictionaryId)
            .Include(uw => uw.Word)
            .ToListAsync();

        if (userWords.Count == 0)
        {
            var newUserWords = dictionary.Words.Select(w => new UserWord
            {
                UserId = dto.UserId,
                DictionaryId = dto.DictionaryId,
                WordId = w.Id
            }).ToList();

            context.UserWords.AddRange(newUserWords);
            await context.SaveChangesAsync();

            userWords = await context.UserWords
                .Where(uw => uw.UserId == dto.UserId && uw.DictionaryId == dto.DictionaryId)
                .Include(uw => uw.Word)
                .ToListAsync();
        }

        var dueWords = userWords
            .Where(uw => uw.Box == 0 || (uw.NextReview.HasValue && uw.NextReview.Value <= DateTime.UtcNow))
            .OrderBy(uw => uw.Box)
            .ThenBy(uw => uw.NextReview)
            .ToList();

        if (dueWords.Count == 0)
            throw new NotFoundException("No words available for review.");

        var correctWord = dueWords[0].Word;
        var allWords = new List<WordDto> { ConvertToDto(correctWord) };

        var otherWords = dictionary.Words
            .Where(w => w.Id != correctWord.Id)
            .OrderBy(_ => Guid.NewGuid())
            .Take(AnswerOptionsCount)
            .Select(ConvertToDto)
            .ToList();

        allWords.AddRange(otherWords);
        allWords = [.. allWords.OrderBy(_ => Guid.NewGuid())];

        return new StartGameResponseDto
        {
            SourceWord = ConvertToDto(correctWord),
            TargetWords = allWords,
            CorrectAnswerId = correctWord.Id
        };
    }

    public async Task CheckChoiceAsync(GameAnswerDto dto)
    {
        var userWord = await context.UserWords
            .FirstOrDefaultAsync(uw => uw.UserId == dto.UserId && uw.WordId == dto.CorrectWordId)
            ?? throw new NotFoundException("User word not found.");

        bool isCorrect = dto.CorrectWordId == dto.ChosenWordId;
        userWord.LastReviewed = DateTime.UtcNow;

        if (isCorrect)
        {
            if (userWord.Box < MaxBox)
            {
                userWord.Box++;
                userWord.NextReview = CalculateNextReview(userWord.Box);
            }
            else
            {
                userWord.Learned = true;
                userWord.NextReview = null;
            }
        }
        else
        {
            userWord.Box = 0;
            userWord.NextReview = DateTime.UtcNow;
        }

        await context.SaveChangesAsync();
    }

    private static DateTime CalculateNextReview(int box)
    {
        var days = box < ReviewIntervals.Length ? ReviewIntervals[box] : DefaultReviewInterval;
        return DateTime.UtcNow.AddDays(days);
    }

    private static WordDto ConvertToDto(Word word)
    {
        return new WordDto
        {
            Id = word.Id,
            SourceWord = word.SourceWord,
            TargetWord = word.TargetWord,
            SourcePhrases = word.SourcePhrases,
            TargetPhrases = word.TargetPhrases
        };
    }
}