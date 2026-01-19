using FlipMemo.Data;
using FlipMemo.DTOs.Game;
using FlipMemo.Interfaces;
using FlipMemo.Models;
using FlipMemo.Services;
using FlipMemo.Utils;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Moq;

namespace FlipMemo.Tests
{
    public class GameServicesTest
    {
        private readonly Mock<ISpeechScorerService> _mockSpeechService;
        private readonly GameService _gameService;
        private readonly ApplicationDbContext _context;

        public GameServicesTest()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            _context = new ApplicationDbContext(options);
            _mockSpeechService = new Mock<ISpeechScorerService>();
            _gameService = new GameService(_context, _mockSpeechService.Object);
        }

        #region Helpers

        internal async Task FillDataBaseTranslate(
            GameModes mode,
            bool setProgress = false,
            bool learned = false,
            bool nextDue = true)
        {
            DateTime nextReview = nextDue ? DateTime.UtcNow : DateTime.UtcNow.AddDays(1);

            var dictionary = new Dictionary
            {
                Id = 1,
                Language = "ENG",
                Name = "test",
            };
            await _context.AddAsync(dictionary);

            var words = new Word[]
            {
                new (){Id = 1, Dictionaries = [dictionary], SourceWord = "test1"},
                new (){Id = 2, Dictionaries = [dictionary], SourceWord = "test2"},
                new (){Id = 3, Dictionaries = [dictionary], SourceWord = "test3"},
                new (){Id = 4, Dictionaries = [dictionary], SourceWord = "test4"},
            };

            var user = new User
            {
                CreatedAt = DateTime.Now,
                Email = "example@email.com",
                Id = 1,
                MustChangePassword = false,
                Role = Roles.User
            };
            await _context.Users.AddAsync(user);

            await _context.Words.AddRangeAsync(words);
            await _context.SaveChangesAsync();

            if (setProgress)
            {
                var progress = _context.Words.Select(w => new StudyProgress
                {
                    UserId = user.Id,
                    WordId = w.Id,
                    DictionaryId = dictionary.Id,
                    Mode = mode,
                    Learned = learned,
                    NextReview = nextReview,
                    Box = 1
                }).ToList();

                await _context.StudyProgresses.AddRangeAsync(progress);
            }

            await _context.SaveChangesAsync();
        }

        internal async Task FillDataBaseListeningSpeaking(
            bool setProgress = false,
            bool learned = false,
            bool nextDue = true)
        {
            DateTime nextReview = nextDue ? DateTime.UtcNow : DateTime.UtcNow.AddDays(1);

            var dictionary = new Dictionary
            {
                Id = 1,
                Language = "ENG",
                Name = "test",
            };
            await _context.AddAsync(dictionary);

            var words = new Word[]
            {
                new (){Id = 1, Dictionaries = [dictionary], SourceWord = "test1", AudioFile = [1, 2, 3]},
                new (){Id = 2, Dictionaries = [dictionary], SourceWord = "test2", AudioFile = [1, 2, 3]},
                new (){Id = 3, Dictionaries = [dictionary], SourceWord = "test3", AudioFile = [1, 2, 3]},
                new (){Id = 4, Dictionaries = [dictionary], SourceWord = "test4", AudioFile = [1, 2, 3]},
            };

            var user = new User
            {
                CreatedAt = DateTime.Now,
                Email = "example@email.com",
                Id = 1,
                MustChangePassword = false,
                Role = Roles.User
            };
            await _context.Users.AddAsync(user);

            await _context.Words.AddRangeAsync(words);
            await _context.SaveChangesAsync();

            if (setProgress)
            {
                var listening = _context.Words.Select(w => new StudyProgress
                {
                    UserId = user.Id,
                    WordId = w.Id,
                    DictionaryId = dictionary.Id,
                    Mode = GameModes.Listening,
                    Learned = learned,
                    NextReview = nextReview,
                    Box = 1
                });

                var speaking = _context.Words.Select(w => new StudyProgress
                {
                    UserId = user.Id,
                    WordId = w.Id,
                    DictionaryId = dictionary.Id,
                    Mode = GameModes.Speaking,
                    Learned = learned,
                    NextReview = nextReview,
                    Box = 1,
                    Score = null
                });

                await _context.StudyProgresses.AddRangeAsync(listening);
                await _context.StudyProgresses.AddRangeAsync(speaking);
            }

            await _context.SaveChangesAsync();
        }

        #endregion

        #region TranslateMethods

        [Fact]
        public async Task GetQuestionAsync_DictionaryWasNotFound_ThrowsNotFoundException()
        {
            await FillDataBaseTranslate(GameModes.TranslateSourceToTarget);

            var dto = new StartGameRequestDto
            {
                DictionaryId = 2,
                UserId = 1,
                Mode = GameModes.TranslateSourceToTarget
            };

            var exception = await Assert.ThrowsAsync<NotFoundException>(() => _gameService.GetQuestionAsync(dto));
            Assert.Equal("Dictionary not found.", exception.Message);
        }

        [Fact]
        public async Task GetQuestionAsync_DictionaryExistsAndUserHaveWordForReview_PickWordsForGame()
        {
            await FillDataBaseTranslate(GameModes.TranslateSourceToTarget);

            var dto = new StartGameRequestDto
            {
                DictionaryId = 1,
                UserId = 1,
                Mode = GameModes.TranslateSourceToTarget
            };

            var result = await _gameService.GetQuestionAsync(dto);

            Assert.NotNull(result);
            Assert.Equal(4, result.Answers!.Count);
        }

        [Fact]
        public async Task GetQuestionAsync_DictionaryExistsAndUserDoesNotHaveWordForRewiew_ThrowsNotFoundException()
        {
            await FillDataBaseTranslate(GameModes.TranslateSourceToTarget, setProgress: true, learned: false, nextDue: false);

            var dto = new StartGameRequestDto
            {
                DictionaryId = 1,
                UserId = 1,
                Mode = GameModes.TranslateSourceToTarget
            };

            var exception = await Assert.ThrowsAnyAsync<NotFoundException>(() => _gameService.GetQuestionAsync(dto));
            Assert.Equal("No words available for review.", exception.Message);
        }

        [Fact]
        public async Task GetQuestionAsync_DictionaryExistsAndUserLearnedAllWords_ThrowsNotFoundException()
        {
            await FillDataBaseTranslate(GameModes.TranslateSourceToTarget, setProgress: true, learned: true);

            var dto = new StartGameRequestDto
            {
                DictionaryId = 1,
                UserId = 1,
                Mode = GameModes.TranslateSourceToTarget
            };

            var exception = await Assert.ThrowsAsync<NotFoundException>(() => _gameService.GetQuestionAsync(dto));
            Assert.Equal("No words available for review.", exception.Message);
        }

        [Fact]
        public async Task CheckChoiceAsync_ProgressDoesNotExist_ThrowsNotFoundException()
        {
            await FillDataBaseTranslate(GameModes.TranslateSourceToTarget);

            var dto = new GameAnswerRequestDto
            {
                UserId = 1,
                DictionaryId = 1,
                Mode = GameModes.TranslateSourceToTarget,
                ChosenWordId = int.MaxValue,
                QuestionWordId = int.MaxValue
            };

            var exception = await Assert.ThrowsAnyAsync<NotFoundException>(() => _gameService.CheckChoiceAsync(dto));
            Assert.Equal("Progress record not found.", exception.Message);
        }

        [Fact]
        public async Task CheckChoiceAsync_ProgressExistsAndUserAnswerWasCorrect_UpdatesProgress()
        {
            await FillDataBaseTranslate(GameModes.TranslateSourceToTarget, setProgress: true);

            var dto = new GameAnswerRequestDto
            {
                UserId = 1,
                DictionaryId = 1,
                Mode = GameModes.TranslateSourceToTarget,
                ChosenWordId = 1,
                QuestionWordId = 1
            };

            var result = await _gameService.CheckChoiceAsync(dto);

            var progress = await _context.StudyProgresses.SingleOrDefaultAsync(p =>
                p.WordId == 1 && p.UserId == 1 && p.DictionaryId == 1 && p.Mode == GameModes.TranslateSourceToTarget);

            Assert.True(result.IsCorrect);
            Assert.Equal(2, result.Box);
            Assert.NotNull(progress!.NextReview);
            Assert.NotNull(progress!.LastReviewed);
        }

        [Fact]
        public async Task CheckChoiceAsync_ProgressExistsAndUserAnswerWasWrong_ResetsProgress()
        {
            await FillDataBaseTranslate(GameModes.TranslateSourceToTarget, setProgress: true);

            var dto = new GameAnswerRequestDto
            {
                UserId = 1,
                DictionaryId = 1,
                Mode = GameModes.TranslateSourceToTarget,
                ChosenWordId = 2,
                QuestionWordId = 1
            };

            var result = await _gameService.CheckChoiceAsync(dto);

            var progress = await _context.StudyProgresses.SingleOrDefaultAsync(p =>
                p.WordId == 1 && p.UserId == 1 && p.DictionaryId == 1 && p.Mode == GameModes.TranslateSourceToTarget);

            Assert.False(result.IsCorrect);
            Assert.Equal(0, result.Box);
            Assert.NotNull(progress!.NextReview);
            Assert.NotNull(progress!.LastReviewed);
        }

        #endregion

        #region ListeningMethods

        [Fact]
        public async Task GetListeningQuestionAsync_DictionaryWasNotFound_ThrowsNotFoundException()
        {
            await FillDataBaseListeningSpeaking();

            var dto = new StartGameRequestDto
            {
                DictionaryId = 2,
                UserId = 1,
                Mode = GameModes.Listening
            };

            var exception = await Assert.ThrowsAsync<NotFoundException>(() => _gameService.GetListeningQuestionAsync(dto));
            Assert.Equal("Dictionary not found.", exception.Message);
        }

        [Fact]
        public async Task GetListeningQuestionAsync_DictionaryExistsAndUserHaveWordForReview_PickWordForGame()
        {
            await FillDataBaseListeningSpeaking();

            var dto = new StartGameRequestDto
            {
                DictionaryId = 1,
                UserId = 1,
                Mode = GameModes.Listening
            };

            var result = await _gameService.GetListeningQuestionAsync(dto);

            Assert.NotNull(result);
            Assert.NotNull(result.AudioBytes);
        }

        [Fact]
        public async Task GetListeningQuestionAsync_DictionaryExistsAndUserDoesNotHaveWordForRewiew_ThrowsNotFoundException()
        {
            await FillDataBaseListeningSpeaking(setProgress: true, learned: false, nextDue: false);

            var dto = new StartGameRequestDto
            {
                DictionaryId = 1,
                UserId = 1,
                Mode = GameModes.Listening
            };

            var exception = await Assert.ThrowsAnyAsync<NotFoundException>(() => _gameService.GetListeningQuestionAsync(dto));
            Assert.Equal("No words available for listening review.", exception.Message);
        }

        [Fact]
        public async Task GetListeningQuestionAsync_DictionaryExistsAndUserLearnedAllWords_ThrowsNotFoundException()
        {
            await FillDataBaseListeningSpeaking(setProgress: true, learned: true);

            var dto = new StartGameRequestDto
            {
                DictionaryId = 1,
                UserId = 1,
                Mode = GameModes.Listening
            };

            var exception = await Assert.ThrowsAsync<NotFoundException>(() => _gameService.GetListeningQuestionAsync(dto));
            Assert.Equal("No words available for listening review.", exception.Message);
        }

        [Fact]
        public async Task CheckListeningAnswerAsync_ProgressDoesNotExist_ThrowsNotFoundException()
        {
            await FillDataBaseListeningSpeaking();

            var dto = new ListeningAnswerRequestDto
            {
                UserId = 1,
                DictionaryId = 1,
                Answer = "test1",
                WordId = 1
            };

            var exception = await Assert.ThrowsAnyAsync<NotFoundException>(() => _gameService.CheckListeningAnswerAsync(dto));
            Assert.Equal("Progress record not found.", exception.Message);
        }

        [Fact]
        public async Task CheckListeningAnswerAsync_ProgressExistsAndUserAnswerWasCorrect_UpdatesProgress()
        {
            await FillDataBaseListeningSpeaking(setProgress: true);

            var dto = new ListeningAnswerRequestDto
            {
                UserId = 1,
                DictionaryId = 1,
                Answer = "test1",
                WordId = 1
            };

            var result = await _gameService.CheckListeningAnswerAsync(dto);

            var progress = await _context.StudyProgresses.SingleOrDefaultAsync(p =>
                p.WordId == 1 && p.UserId == 1 && p.DictionaryId == 1 && p.Mode == GameModes.Listening);

            Assert.True(result.IsCorrect);
            Assert.Equal(2, result.Box);
            Assert.NotNull(progress!.NextReview);
            Assert.NotNull(progress!.LastReviewed);
        }

        [Fact]
        public async Task CheckListeningAnswerAsync_ProgressExistsAndUserAnswerWasWrong_ResetsProgress()
        {
            await FillDataBaseListeningSpeaking(setProgress: true);

            var dto = new ListeningAnswerRequestDto
            {
                UserId = 1,
                DictionaryId = 1,
                Answer = "miss",
                WordId = 1
            };

            var result = await _gameService.CheckListeningAnswerAsync(dto);

            var progress = await _context.StudyProgresses.SingleOrDefaultAsync(p =>
                p.WordId == 1 && p.UserId == 1 && p.DictionaryId == 1 && p.Mode == GameModes.Listening);

            Assert.False(result.IsCorrect);
            Assert.Equal(0, result.Box);
            Assert.NotNull(progress!.NextReview);
            Assert.NotNull(progress!.LastReviewed);
        }

        #endregion

        #region SpeakingMethods

        [Fact]
        public async Task GetSpeakingQuestionAsync_DictionaryWasNotFound_ThrowsNotFoundException()
        {
            await FillDataBaseListeningSpeaking();

            var dto = new StartGameRequestDto
            {
                DictionaryId = 2,
                UserId = 1,
                Mode = GameModes.Speaking
            };

            var exception = await Assert.ThrowsAsync<NotFoundException>(() => _gameService.GetSpeakingQuestionAsync(dto));
            Assert.Equal("Dictionary not found.", exception.Message);
        }

        [Fact]
        public async Task GetSpeakingQuestionAsync_DictionaryExistsAndUserHaveWordForReview_PickWordForGame()
        {
            await FillDataBaseListeningSpeaking();

            var dto = new StartGameRequestDto
            {
                DictionaryId = 1,
                UserId = 1,
                Mode = GameModes.Speaking
            };

            var result = await _gameService.GetSpeakingQuestionAsync(dto);

            Assert.NotNull(result);
        }

        [Fact]
        public async Task GetSpeakingQuestionAsync_DictionaryExistsAndUserDoesNotHaveWordForRewiew_ThrowsNotFoundException()
        {
            await FillDataBaseListeningSpeaking(setProgress: true, learned: false, nextDue: false);

            var dto = new StartGameRequestDto
            {
                DictionaryId = 1,
                UserId = 1,
                Mode = GameModes.Speaking
            };

            var exception = await Assert.ThrowsAnyAsync<NotFoundException>(() => _gameService.GetSpeakingQuestionAsync(dto));
            Assert.Equal("No words available for speaking review.", exception.Message);
        }

        [Fact]
        public async Task GetSpeakingQuestionAsync_DictionaryExistsAndUserLearnedAllWords_ThrowsNotFoundException()
        {
            await FillDataBaseListeningSpeaking(setProgress: true, learned: true);

            var dto = new StartGameRequestDto
            {
                DictionaryId = 1,
                UserId = 1,
                Mode = GameModes.Speaking
            };

            var exception = await Assert.ThrowsAsync<NotFoundException>(() => _gameService.GetSpeakingQuestionAsync(dto));
            Assert.Equal("No words available for speaking review.", exception.Message);
        }

        [Fact]
        public async Task CheckSpeakingAnswerAsync_ProgressDoesNotExist_ThrowsNotFoundException()
        {
            await FillDataBaseListeningSpeaking();

            var dto = new SpeakingAnswerRequestDto
            {
                UserId = 1,
                DictionaryId = 1,
                WordId = 1,
                RecognizedText = "testWord"
            };

            var exception = await Assert.ThrowsAnyAsync<NotFoundException>(() => _gameService.CheckSpeakingAnswerAsync(dto));
            Assert.Equal("Progress record not found.", exception.Message);
        }

        [Fact]
        public async Task CheckSpeakingAnswerAsync_ProgressExistsAndUserScoreIsHigh_UpdatesProgress()
        {
            await FillDataBaseListeningSpeaking(setProgress: true);

            _mockSpeechService
                .Setup(x => x.GetSpeechScoreAsync(
                    It.IsAny<string>(),
                    It.IsAny<string>()))
                .ReturnsAsync(70);

            var dto = new SpeakingAnswerRequestDto
            {
                UserId = 1,
                DictionaryId = 1,
                WordId = 1,
                RecognizedText = "testWord"
            };

            var result = await _gameService.CheckSpeakingAnswerAsync(dto);

            var progress = await _context.StudyProgresses.SingleOrDefaultAsync(p =>
                p.WordId == 1 && p.UserId == 1 && p.DictionaryId == 1 && p.Mode == GameModes.Speaking);

            Assert.True(result.IsCorrect);
            Assert.Equal(2, result.Box);
            Assert.NotNull(progress!.NextReview);
            Assert.NotNull(progress!.LastReviewed);
            Assert.True(result.Score >= 70);
        }

        [Fact]
        public async Task CheckSpeakingAnswerAsync_ProgressExistsAndUserAnswerScoreIsLow_ResetsProgress()
        {
            await FillDataBaseListeningSpeaking(setProgress: true);

            _mockSpeechService
                .Setup(x => x.GetSpeechScoreAsync(
                    It.IsAny<string>(),
                    It.IsAny<string>()))
                .ReturnsAsync(45);

            var dto = new SpeakingAnswerRequestDto
            {
                UserId = 1,
                DictionaryId = 1,
                WordId = 1,
                RecognizedText = "testWord"
            };

            var result = await _gameService.CheckSpeakingAnswerAsync(dto);

            var progress = await _context.StudyProgresses.SingleOrDefaultAsync(p =>
                p.WordId == 1 && p.UserId == 1 && p.DictionaryId == 1 && p.Mode == GameModes.Speaking);

            Assert.False(result.IsCorrect);
            Assert.Equal(0, result.Box);
            Assert.NotNull(progress!.NextReview);
            Assert.NotNull(progress!.LastReviewed);
            Assert.False(result.Score >= 70);
        }

        #endregion
    }
}
