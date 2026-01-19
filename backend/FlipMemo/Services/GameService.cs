using FlipMemo.Data;
using FlipMemo.DTOs.Game;
using FlipMemo.DTOs.WordAndDictionary;
using FlipMemo.Interfaces;
using FlipMemo.Models;
using FlipMemo.Utils;
using Microsoft.EntityFrameworkCore;

namespace FlipMemo.Services;

public class GameService(ApplicationDbContext context, ISpeechScorerService speechService) : IGameService
{
    private static readonly int[] _reviewIntervals = [1, 2, 4, 8, 16];
    private const int _maxBoxUntilLearned = 3;
    private const int _answerOptionsCount = 3;
    private const int _defaultReviewInterval = 30;
    private const int _speakingScoreThreshold = 70;

    #region TranslationMode

    public async Task<StartGameResponseDto> GetQuestionAsync(StartGameRequestDto dto)
    {
        var dictionary = await context.Dictionaries
            .Include(d => d.Words)
            .SingleOrDefaultAsync(d => d.Id == dto.DictionaryId)
            ?? throw new NotFoundException("Dictionary not found.");

        var progress = await GetOrCreateStudyProgressAsync(dto.UserId, dto.DictionaryId, dto.Mode, dictionary);

        var due = progress
            .Where(p => !p.Learned && (p.Box == 0 || (p.NextReview.HasValue && p.NextReview.Value <= DateTime.UtcNow)))
            .OrderBy(p => p.Box)
            .ThenBy(p => p.NextReview)
            .ToList();

        if (due.Count == 0)
            throw new NotFoundException("No words available for review.");

        var correctWord = due[0].Word;

        var allWords = new List<WordDto> { ConvertToDto(correctWord) };

        var otherWords = dictionary.Words
            .Where(w => w.Id != correctWord.Id)
            .OrderBy(_ => Guid.NewGuid())
            .Take(_answerOptionsCount)
            .Select(ConvertToDto)
            .ToList();

        allWords.AddRange(otherWords);
        allWords = [.. allWords.OrderBy(_ => Guid.NewGuid())];

        return new StartGameResponseDto
        {
            SourceWord = ConvertToDto(correctWord),
            Answers = allWords
        };
    }

    public async Task<GameAnswerResponseDto> CheckChoiceAsync(GameAnswerRequestDto dto)
    {
        var progress = await context.StudyProgresses
            .FirstOrDefaultAsync(p =>
                p.UserId == dto.UserId &&
                p.WordId == dto.QuestionWordId &&
                p.DictionaryId == dto.DictionaryId &&
                p.Mode == dto.Mode)
            ?? throw new NotFoundException("Progress record not found.");

        bool isCorrect = dto.ChosenWordId == dto.QuestionWordId;

        progress.LastReviewed = DateTime.UtcNow;
        UpdateBox(progress, isCorrect);

        await context.SaveChangesAsync();

        return new GameAnswerResponseDto
        {
            IsCorrect = isCorrect,
            Box = progress.Box
        };
    }

    #endregion

    #region ListeningMode

    public async Task<ListeningQuestionResponseDto> GetListeningQuestionAsync(StartGameRequestDto dto)
    {
        var dictionary = await context.Dictionaries
            .Include(d => d.Words)
            .SingleOrDefaultAsync(d => d.Id == dto.DictionaryId)
            ?? throw new NotFoundException("Dictionary not found.");

        var progress = await GetOrCreateStudyProgressAsync(dto.UserId, dto.DictionaryId, dto.Mode, dictionary);

        var due = progress
            .Where(p => !p.Learned
                && p.Word.AudioFile != null
                && (p.Box == 0 || (p.NextReview.HasValue && p.NextReview.Value <= DateTime.UtcNow)))
            .OrderBy(p => p.Box)
            .ThenBy(p => p.NextReview)
            .ToList();

        if (due.Count == 0)
            throw new NotFoundException("No words available for listening review.");

        var correctWord = due[0].Word;

        if (correctWord.AudioFile == null)
            throw new NotFoundException("No words available for listening review.");

        return new ListeningQuestionResponseDto
        {
            WordId = correctWord.Id,
            AudioBytes = correctWord.AudioFile
        };
    }

    public async Task<ListeningAnswerResponseDto> CheckListeningAnswerAsync(ListeningAnswerRequestDto dto)
    {
        var mode = GameModes.Listening;

        var progress = await context.StudyProgresses
            .Include(p => p.Word)
            .FirstOrDefaultAsync(p =>
                p.UserId == dto.UserId &&
                p.WordId == dto.WordId &&
                p.DictionaryId == dto.DictionaryId &&
                p.Mode == mode)
            ?? throw new NotFoundException("Progress record not found.");

        bool isCorrect = string.Equals(dto.Answer?.Trim(), progress.Word.SourceWord?.Trim(), StringComparison.OrdinalIgnoreCase);

        progress.LastReviewed = DateTime.UtcNow;
        UpdateBox(progress, isCorrect);

        await context.SaveChangesAsync();

        return new ListeningAnswerResponseDto
        {
            IsCorrect = isCorrect,
            CorrectAnswer = progress.Word.SourceWord!,
            Box = progress.Box
        };
    }

    #endregion

    #region SpeakingMode

    public async Task<SpeakingQuestionResponseDto> GetSpeakingQuestionAsync(StartGameRequestDto dto)
    {
        var dictionary = await context.Dictionaries
            .Include(d => d.Words)
            .SingleOrDefaultAsync(d => d.Id == dto.DictionaryId)
            ?? throw new NotFoundException("Dictionary not found.");

        var progress = await GetOrCreateStudyProgressAsync(dto.UserId, dto.DictionaryId, dto.Mode, dictionary);

        var due = progress
            .Where(p => !p.Learned && (p.Box == 0 || (p.NextReview.HasValue && p.NextReview.Value <= DateTime.UtcNow)))
            .OrderBy(p => p.Box)
            .ThenBy(p => p.NextReview)
            .ToList();

        if (due.Count == 0)
            throw new NotFoundException("No words available for speaking review.");

        var correctWord = due[0].Word;

        return new SpeakingQuestionResponseDto
        {
            Word = ConvertToDto(correctWord)
        };
    }

    public async Task<SpeakingAnswerResponseDto> CheckSpeakingAnswerAsync(SpeakingAnswerRequestDto dto)
    {
        var mode = GameModes.Speaking;

        var progress = await context.StudyProgresses
            .Include(p => p.Word)
            .FirstOrDefaultAsync(p =>
                p.UserId == dto.UserId &&
                p.WordId == dto.WordId &&
                p.DictionaryId == dto.DictionaryId &&
                p.Mode == mode)
            ?? throw new NotFoundException("Progress record not found.");

        var score = await speechService.GetSpeechScoreAsync(dto.RecognizedText, progress.Word.SourceWord);
        bool isCorrect = score >= _speakingScoreThreshold;

        progress.Score = score;
        progress.LastReviewed = DateTime.UtcNow;

        UpdateBox(progress, isCorrect);

        await context.SaveChangesAsync();

        return new SpeakingAnswerResponseDto
        {
            IsCorrect = isCorrect,
            Score = score,
            Box = progress.Box
        };
    }

    #endregion

    #region BoxManagement

    private static void UpdateBox(StudyProgress progress, bool isCorrect)
    {
        if (isCorrect)
        {
            if (progress.Box < _maxBoxUntilLearned)
            {
                progress.NextReview = CalculateNextReview(progress.Box);
            }
            else
            {
                progress.Learned = true;
                progress.NextReview = null;
            }

            progress.Box++;
        }
        else
        {
            progress.Box = 0;
            progress.NextReview = DateTime.UtcNow;
        }
    }

    #endregion

    #region HelperMethods

    private async Task<List<StudyProgress>> GetOrCreateStudyProgressAsync(
        int userId,
        int dictionaryId,
        GameModes mode,
        Dictionary dictionary)
    {
        var progress = await context.StudyProgresses
            .Where(p => p.UserId == userId && p.DictionaryId == dictionaryId && p.Mode == mode)
            .Include(p => p.Word)
            .ToListAsync();

        if (progress.Count != 0)
            return progress;

        var newRows = dictionary.Words.Select(w => new StudyProgress
        {
            UserId = userId,
            DictionaryId = dictionaryId,
            WordId = w.Id,
            Mode = mode,
            Box = 0,
            Learned = false
        }).ToList();

        context.StudyProgresses.AddRange(newRows);
        await context.SaveChangesAsync();

        return await context.StudyProgresses
            .Where(p => p.UserId == userId && p.DictionaryId == dictionaryId && p.Mode == mode)
            .Include(p => p.Word)
            .ToListAsync();
    }

    private static DateTime CalculateNextReview(int box)
    {
        var interval = box < _reviewIntervals.Length ? _reviewIntervals[box] : _defaultReviewInterval;
        return DateTime.UtcNow.AddMinutes(interval);
    }

    private static WordDto ConvertToDto(Word word) => new()
    {
        Id = word.Id,
        SourceWord = word.SourceWord,
        TargetWord = word.TargetWord,
        SourcePhrases = word.SourcePhrases,
        TargetPhrases = word.TargetPhrases
    };

    #endregion
}
