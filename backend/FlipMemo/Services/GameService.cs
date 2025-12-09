using FlipMemo.Data;
using FlipMemo.DTOs;
using FlipMemo.Interfaces;
using FlipMemo.Models;
using FlipMemo.Utils;
using Microsoft.EntityFrameworkCore;

namespace FlipMemo.Services;

public class GameService(ApplicationDbContext context) : IGameService
{
    public WordDto ConvertToDto(Word word)
    {
        return new WordDto()
        {
            Id = word.Id,
            SourceWord = word.SourceWord,
            TargetWord = word.TargetWord,
            SourcePhrases = word.SourcePhrases,
            TargetPhrases = word.TargetPhrases
        };
    }
    public DateTime CalculateNextReview(int box)
    {
        var intervals = new[] { 2, 4, 6, 8, 16 };
        var days = box < intervals.Length ? intervals[box] : 30;
        return DateTime.UtcNow.AddDays(days);
    }
    public async Task CheckAnswerTranslate(GameAnswerDto dto)
    {
        var UserWord = await context.UserWords
               .FirstOrDefaultAsync(x => x.UserId == dto.UserId
                               && x.WordId == dto.TargetWordId);

        if (dto.TargetWordId == dto.PickedWordId)
        {
            if(UserWord!.Box < 4)
            {
                UserWord.LastReviewed = DateTime.UtcNow;
                UserWord.NextReview = CalculateNextReview(UserWord.Box);
                UserWord.Box++;
            }
            else
            {
                UserWord.LastReviewed = DateTime.UtcNow;
                UserWord.Learned = true;
                UserWord.NextReview = null;
            }
        }
        else
        {
            UserWord!.Box = 0;
            UserWord.LastReviewed = DateTime.UtcNow;
            UserWord.NextReview = DateTime.UtcNow;
        }

        await context.SaveChangesAsync();
    }

    public async Task<StartGameResponseDto> Pick4RandomAsync(StartGameRequestDto dto)
    {
        var dictionary = await context.Dictionaries
              .Include(d => d.Words)
              .SingleOrDefaultAsync(d => d.Id == dto.DictionaryId);

        var UserWords = await context.UserWords
                    .Where(uw => uw.UserId == dto.userId && uw.DictionaryId == dto.DictionaryId)
                    .Include(uw => uw.Word)
                    .ToListAsync();

        if (UserWords.Count == 0)
        {
            var newUserWords = dictionary!.Words.Select(w => new UserWord
            {
                UserId = dto.userId,
                DictionaryId = dto.DictionaryId,
                WordId = w.Id
            }).ToList();
            context.UserWords.AddRange(newUserWords);
            await context.SaveChangesAsync();

            UserWords = await context.UserWords
                    .Where(uw => uw.UserId == dto.userId && uw.DictionaryId == dto.DictionaryId)
                    .Include(uw => uw.Word)
                    .ToListAsync();
        }
        
        var dueWords = UserWords
                       .Where(uw => uw.Box == 0 || (uw.NextReview.HasValue && uw.NextReview.Value <= DateTime.UtcNow))
                       .OrderBy(uw => uw.Box)
                       .ThenBy(uw => uw.NextReview)
                       .ToList();
        if(dueWords.Count == 0) 
        {
            throw new NotFoundException("No words available for review");
        }
        var allWords = new List<WordDto> { ConvertToDto(dueWords[0].Word) };

        var otherWords = dictionary!.Words
                .Where(w => w.Id != dueWords[0].Word.Id)
                .OrderBy(w => Guid.NewGuid())
                .Take(3)
                .ToList();

        allWords.AddRange(otherWords.Select(w => ConvertToDto(w)));

        allWords = allWords.OrderBy(w => Guid.NewGuid()).ToList();

        return new StartGameResponseDto
        {
            Source = ConvertToDto(dueWords[0].Word),
            Targets = allWords,
            CorrectAnswerId = dueWords[0].Word.Id
        };
    }
}