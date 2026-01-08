using FlipMemo.Data;
using FlipMemo.DTOs.Game;
using FlipMemo.DTOs.WordAndDictionary;
using FlipMemo.Interfaces;
using FlipMemo.Interfaces.External;
using FlipMemo.Models;
using FlipMemo.Utils;
using Microsoft.EntityFrameworkCore;

namespace FlipMemo.Services;

public class GameService(ApplicationDbContext context, ISpeechRecognitionService speechService) : IGameService
{
    private static readonly int[] _reviewIntervals = [2, 4, 6, 8, 16];
    private const int _maxBox = 4;
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

        var userWords = await GetOrCreateUserWordsAsync(dto.UserId, dto.DictionaryId, dictionary);

        var dueWords = userWords
            .Where(uw => !uw.Learned && (uw.Box == 0 || (uw.NextReview.HasValue && uw.NextReview.Value <= DateTime.UtcNow)))
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

    public async Task CheckChoiceAsync(GameAnswerDto dto)
    {
        var userWord = await context.UserWords
            .FirstOrDefaultAsync(uw => uw.UserId == dto.UserId && uw.WordId == dto.QuestionWordId)
            ?? throw new NotFoundException("User word not found.");

        bool isCorrect = dto.ChosenWordId == dto.QuestionWordId;
        userWord.LastReviewed = DateTime.UtcNow;

        UpdateUserWordBox(userWord, isCorrect);

        await context.SaveChangesAsync();
    }

    #endregion

    #region ListeningMode

    public async Task<ListeningQuestionResponseDto> GetListeningQuestionAsync(StartGameRequestDto dto)
    {
        var dictionary = await context.Dictionaries
            .Include(d => d.Words)
            .SingleOrDefaultAsync(d => d.Id == dto.DictionaryId)
            ?? throw new NotFoundException("Dictionary not found.");

        var voices = await GetOrCreateVoicesAsync(dto.UserId, dictionary);

        var dueVoices = voices
            .Where(v => !v.ListeningLearned && (v.ListeningBox == 0 || (v.ListeningNextReview.HasValue && v.ListeningNextReview.Value <= DateTime.UtcNow)))
            .OrderBy(v => v.ListeningBox)
            .ThenBy(v => v.ListeningNextReview)
            .ToList();

        if (dueVoices.Count == 0)
            throw new NotFoundException("No words available for listening review.");

        var correctWord = dueVoices[0].Word;

        if (correctWord.AudioFile == null)
            throw new NotFoundException("No words available for listening review.");

        return new ListeningQuestionResponseDto
        {
            WordId = correctWord.Id,
            AudioBytes = correctWord.AudioFile
        };
    }

    public async Task<ListeningAnswerResponseDto> CheckListeningAnswerAsync(ListeningAnswerDto dto)
    {
        var voice = await context.Voices
            .Include(v => v.Word)
            .FirstOrDefaultAsync(v => v.UserId == dto.UserId && v.WordId == dto.WordId)
            ?? throw new NotFoundException("Voice record not found.");

        bool isCorrect = string.Equals(dto.Answer?.Trim(), voice.Word.SourceWord?.Trim(), StringComparison.OrdinalIgnoreCase);

        voice.ListeningLastReviewed = DateTime.UtcNow;

        UpdateVoiceListeningBox(voice, isCorrect);

        await context.SaveChangesAsync();

        return new ListeningAnswerResponseDto
        {
            IsCorrect = isCorrect,
            CorrectAnswer = voice.Word.SourceWord!
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

        var voices = await GetOrCreateVoicesAsync(dto.UserId, dictionary);

        var dueVoices = voices
            .Where(v => !v.SpeakingLearned && (v.SpeakingBox == 0 || (v.SpeakingNextReview.HasValue && v.SpeakingNextReview.Value <= DateTime.UtcNow)))
            .OrderBy(v => v.SpeakingBox)
            .ThenBy(v => v.SpeakingNextReview)
            .ToList();

        if (dueVoices.Count == 0)
            throw new NotFoundException("No words available for speaking review.");

        var correctWord = dueVoices[0].Word;

        return new SpeakingQuestionResponseDto
        {
            Word = ConvertToDto(correctWord)
        };
    }

    public async Task<SpeakingAnswerResponseDto> CheckSpeakingAnswerAsync(SpeakingAnswerDto dto)
    {
        var voice = await context.Voices
            .Include(v => v.Word)
            .FirstOrDefaultAsync(v => v.UserId == dto.UserId && v.WordId == dto.WordId)
            ?? throw new NotFoundException("Voice record not found.");
        
        byte[] audioBytes;
        using (var memoryStream = new MemoryStream())
        {
            await dto.AudioFile.CopyToAsync(memoryStream);
            audioBytes = memoryStream.ToArray();
        }

        var recognitionResult = await speechService.RecognizeSpeechAsync(audioBytes, voice.Word.SourceWord, dto.Language);

        int score = recognitionResult.Score;
        bool isCorrect = score >= _speakingScoreThreshold;

        voice.SpeakingScore = score;
        voice.SpeakingLastReviewed = DateTime.UtcNow;

        UpdateVoiceSpeakingBox(voice, isCorrect);

        await context.SaveChangesAsync();

        return new SpeakingAnswerResponseDto
        {
            IsCorrect = isCorrect,
            Score = score
        };
    }

    #endregion

    #region BoxManagement

    private static void UpdateUserWordBox(UserWord userWord, bool isCorrect)
    {
        if (isCorrect)
        {
            if (userWord.Box < _maxBox)
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
    }

    private static void UpdateVoiceListeningBox(Voice voice, bool isCorrect)
    {
        if (isCorrect)
        {
            if (voice.ListeningBox < _maxBox)
            {
                voice.ListeningBox++;
                voice.ListeningNextReview = CalculateNextReview(voice.ListeningBox);
            }
            else
            {
                voice.ListeningLearned = true;
                voice.ListeningNextReview = null;
            }
        }
        else
        {
            voice.ListeningBox = 0;
            voice.ListeningNextReview = DateTime.UtcNow;
        }
    }

    private static void UpdateVoiceSpeakingBox(Voice voice, bool isCorrect)
    {
        if (isCorrect)
        {
            if (voice.SpeakingBox < _maxBox)
            {
                voice.SpeakingBox++;
                voice.SpeakingNextReview = CalculateNextReview(voice.SpeakingBox);
            }
            else
            {
                voice.SpeakingLearned = true;
                voice.SpeakingNextReview = null;
            }
        }
        else
        {
            voice.SpeakingBox = 0;
            voice.SpeakingNextReview = DateTime.UtcNow;
        }
    }

    #endregion

    #region HelperMethods

    private async Task<List<UserWord>> GetOrCreateUserWordsAsync(int userId, int dictionaryId, Dictionary dictionary)
    {
        var userWords = await context.UserWords
            .Where(uw => uw.UserId == userId && uw.DictionaryId == dictionaryId)
            .Include(uw => uw.Word)
            .ToListAsync();

        if (userWords.Count == 0)
        {
            var newUserWords = dictionary.Words.Select(w => new UserWord
            {
                UserId = userId,
                DictionaryId = dictionaryId,
                WordId = w.Id
            }).ToList();

            context.UserWords.AddRange(newUserWords);
            await context.SaveChangesAsync();

            userWords = await context.UserWords
                .Where(uw => uw.UserId == userId && uw.DictionaryId == dictionaryId)
                .Include(uw => uw.Word)
                .ToListAsync();
        }

        return userWords;
    }

    private async Task<List<Voice>> GetOrCreateVoicesAsync(int userId, Dictionary dictionary)
    {
        var voices = await context.Voices
            .Where(v => v.UserId == userId && dictionary.Words.Select(w => w.Id).Contains(v.WordId))
            .Include(v => v.Word)
            .ToListAsync();

        var existingWordIds = voices.Select(v => v.WordId).ToHashSet();
        var missingWords = dictionary.Words.Where(w => !existingWordIds.Contains(w.Id)).ToList();

        if (missingWords.Count > 0)
        {
            var newVoices = missingWords.Select(w => new Voice
            {
                UserId = userId,
                WordId = w.Id
            }).ToList();

            context.Voices.AddRange(newVoices);
            await context.SaveChangesAsync();

            voices = await context.Voices
                .Where(v => v.UserId == userId && dictionary.Words.Select(w => w.Id).Contains(v.WordId))
                .Include(v => v.Word)
                .ToListAsync();
        }

        return voices;
    }

    private static DateTime CalculateNextReview(int box)
    {
        var days = box < _reviewIntervals.Length ? _reviewIntervals[box] : _defaultReviewInterval;
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

    #endregion
}