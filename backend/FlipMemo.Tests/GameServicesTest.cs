using FlipMemo.Data;
using FlipMemo.DTOs.Game;
using FlipMemo.Interfaces.External;
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
        private readonly Mock<ISpeechRecognitionService> _MockSpeechRecongnitionService;
        private readonly GameService _gameService;
        private readonly ApplicationDbContext _context;

        public GameServicesTest()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
               .UseInMemoryDatabase(Guid.NewGuid().ToString())
               .Options;
            _context = new ApplicationDbContext(options);
            _MockSpeechRecongnitionService = new Mock<ISpeechRecognitionService>();
            _gameService = new GameService(_context, _MockSpeechRecongnitionService.Object);
        }
        #region Helpers
        internal async Task FillDataBase(bool SetBoxes = false, bool learned = false, bool next = true)
        {
            DateTime nextReview = next ? DateTime.UtcNow : DateTime.UtcNow.AddDays(1);
            var dictionary = new Dictionary
            {
                Id = 1,
                Language = "ENG",
                Name = "test",

            };
            await _context.AddAsync(dictionary);

            var Words = new Word[]
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

            await _context.Words.AddRangeAsync(Words);
            await _context.SaveChangesAsync();
            if (SetBoxes)
            {
                var UserWords = _context.Words.Select(w => new UserWord
                {
                    UserId = user.Id,
                    WordId = w.Id,
                    DictionaryId = dictionary.Id,
                    Learned = learned,
                    NextReview = nextReview,
                    Box = 1
                }).ToList();

                await _context.UserWords.AddRangeAsync(UserWords);
            }
            await _context.SaveChangesAsync();
        }
        internal async Task FillDataBaseListeningAndVoice(bool setBoxes = false, bool learned = false, bool next = true)
        {
            DateTime nextReview = next ? DateTime.UtcNow : DateTime.UtcNow.AddDays(1);
            var dictionary = new Dictionary
            {
                Id = 1,
                Language = "ENG",
                Name = "test",

            };
            await _context.AddAsync(dictionary);

            var Words = new Word[]
            {
                new (){Id = 1, Dictionaries = [dictionary], SourceWord = "test1", AudioFile = [1, 2, 3]},
                new (){Id = 2, Dictionaries = [dictionary], SourceWord = "test2", AudioFile = [1, 2, 3]},
                new (){Id = 3, Dictionaries = [dictionary], SourceWord = "test3", AudioFile =[1, 2, 3]},
                new (){Id = 4, Dictionaries = [dictionary], SourceWord = "test4", AudioFile =[1, 2, 3]},
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

            await _context.Words.AddRangeAsync(Words);
            await _context.SaveChangesAsync();

            if (setBoxes)
            {
                var UserVoice = _context.Words.Select(w => new Voice
                {
                    UserId = user.Id,
                    WordId = w.Id,
                    DictionaryId = dictionary.Id,
                    ListeningLearned = learned,
                    SpeakingLearned = learned,
                    ListeningNextReview = nextReview,
                    SpeakingNextReview = nextReview,
                    ListeningBox = 1,
                    SpeakingBox = 1,
                }).ToList();
                await _context.Voices.AddRangeAsync(UserVoice);
            }
            await _context.SaveChangesAsync();
        }
        #endregion

        #region TranslateMethods

        #region GetQuestionAsync
        [Fact]
        public async Task GetQuestionAsync_DictionaryWasNotFound_ThrowsNotFoundException()
        {
            await FillDataBase();

            var dto = new StartGameRequestDto
            {
                DictionaryId = 2,
                UserId = 1
            };

            var exception = await Assert.ThrowsAsync<NotFoundException>(() => _gameService.GetQuestionAsync(dto));

            Assert.Equal("Dictionary not found.", exception.Message);
        }

        [Fact]
        public async Task GetQuestionAsync_DictionaryExistsAndUserHaveWordForReview_PickWordsForGame()
        {
            await FillDataBase();

            var dto = new StartGameRequestDto
            {
                DictionaryId = 1,
                UserId = 1
            };

            var result = await _gameService.GetQuestionAsync(dto);

            Assert.NotNull(result);
            Assert.Equal(4, result.Answers!.Count);
        }
        [Fact]
        public async Task GetQuestionAsync_DictionaryExistsAndUserDoesNotHaveWordForRewiew_ThrowsNotFoundException()
        {
            await FillDataBase(true, false, false);

            var dto = new StartGameRequestDto
            {
                DictionaryId = 1,
                UserId = 1
            };

            var exception = await Assert.ThrowsAnyAsync<NotFoundException>(() => _gameService.GetQuestionAsync(dto));

            Assert.Equal("No words available for review.", exception.Message);
        }
        [Fact]
        public async Task GetQuestionAsync_DictionaryExistsAndUserLearnedAllWords_ThrowsNotFoundException()
        {
            await FillDataBase(true, true);

            var dto = new StartGameRequestDto
            {
                DictionaryId = 1,
                UserId = 1
            };

            var exception = await Assert.ThrowsAsync<NotFoundException>(() => _gameService.GetQuestionAsync(dto));

            Assert.Equal("No words available for review.", exception.Message);
        }
        #endregion
        #region CheckChoiceAsync

        [Fact]
        public async Task CheckChoiceAsync_UserWordDoesNotExists_ThrowsNotFoundException()
        {
            await FillDataBase();

            var dto = new GameAnswerDto
            {
                UserId = 1,
                DictionaryId = 1,
                ChosenWordId = int.MaxValue,
                QuestionWordId = int.MaxValue
            };

            var exception = await Assert.ThrowsAnyAsync<NotFoundException>(() => _gameService.CheckChoiceAsync(dto));

            Assert.Equal("User word not found.", exception.Message);
        }

        [Fact]
        public async Task CheckChoiceAsync_UserWordExistsAndUserAnswerWasCorrect_UpdatesProgress()
        {
            await FillDataBase(true);

            var dto = new GameAnswerDto
            {
                UserId = 1,
                DictionaryId = 1,
                ChosenWordId = 1,
                QuestionWordId = 1
            };

            var result =  await _gameService.CheckChoiceAsync(dto);
            var userWord = await _context.UserWords.SingleOrDefaultAsync(w => w.WordId == 1);

            Assert.True(result.IsCorrect);
            Assert.Equal(2, result.Box);
            Assert.NotNull(userWord!.NextReview);
            Assert.NotNull(userWord!.LastReviewed);
        }

        [Fact]
        public async Task CheckChoiceAsync_UserWordExistsAndUserAnswerWasWrong_ResetsProgress()
        {
            await FillDataBase(true);

            var dto = new GameAnswerDto
            {
                UserId = 1,
                DictionaryId = 1,
                ChosenWordId = 2,
                QuestionWordId = 1
            };

            var result = await _gameService.CheckChoiceAsync(dto);
            var userWord = await _context.UserWords.SingleOrDefaultAsync(w => w.WordId == 1);

            Assert.False(result.IsCorrect);
            Assert.Equal(0, result.Box);
            Assert.NotNull(userWord!.NextReview);
            Assert.NotNull(userWord!.LastReviewed);
        }
        #endregion

        #endregion

        #region ListeningMethods

        #region GetListeningQuestionAsync
        [Fact]
        public async Task GetListeningQuestionAsync_DictionaryWasNotFound_ThrowsNotFoundException()
        {
            await FillDataBaseListeningAndVoice();

            var dto = new StartGameRequestDto
            {
                DictionaryId = 2,
                UserId = 1
            };

            var exception = await Assert.ThrowsAsync<NotFoundException>(() => _gameService.GetListeningQuestionAsync(dto));

            Assert.Equal("Dictionary not found.", exception.Message);
        }

        [Fact]
        public async Task GetListeningQuestionAsync_DictionaryExistsAndUserHaveWordForReview_PickWordForGame()
        {
            await FillDataBaseListeningAndVoice();

            var dto = new StartGameRequestDto
            {
                DictionaryId = 1,
                UserId = 1
            };

            var result = await _gameService.GetListeningQuestionAsync(dto);

            Assert.NotNull(result);
            Assert.NotNull(result.AudioBytes);
        }
        [Fact]
        public async Task GetListeningQuestionAsync_DictionaryExistsAndUserDoesNotHaveWordForRewiew_ThrowsNotFoundException()
        {
            await FillDataBaseListeningAndVoice(true, false, false);

            var dto = new StartGameRequestDto
            {
                DictionaryId = 1,
                UserId = 1
            };

            var exception = await Assert.ThrowsAnyAsync<NotFoundException>(() => _gameService.GetListeningQuestionAsync(dto));

            Assert.Equal("No words available for listening review.", exception.Message);
        }
        [Fact]
        public async Task GetListeningQuestionAsync_DictionaryExistsAndUserLearnedAllWords_ThrowsNotFoundException()
        {
            await FillDataBaseListeningAndVoice(true, true);

            var dto = new StartGameRequestDto
            {
                DictionaryId = 1,
                UserId = 1
            };

            var exception = await Assert.ThrowsAsync<NotFoundException>(() => _gameService.GetListeningQuestionAsync(dto));

            Assert.Equal("No words available for listening review.", exception.Message);
        }
        #endregion
        #region CheckListeningAnswerAsync
        [Fact]
        public async Task CheckListeningAnswerAsync_VoiceRecordDoesNotExists_ThrowsNotFoundException()
        {
            await FillDataBaseListeningAndVoice();

            var dto = new ListeningAnswerDto
            {
                UserId = 1,
                DictionaryId = 1,
                Answer = "test1",
                WordId = 1
            };

            var exception = await Assert.ThrowsAnyAsync<NotFoundException>(() => _gameService.CheckListeningAnswerAsync(dto));

            Assert.Equal("Voice record not found.", exception.Message);
        }

        [Fact]
        public async Task CheckListeningAnswerAsync_VoiceRecordExistsAndUserAnswerWasCorrect_UpdatesProgress()
        {
            await FillDataBaseListeningAndVoice(true);

            var dto = new ListeningAnswerDto
            {
                UserId = 1,
                DictionaryId = 1,
                Answer = "test1",
                WordId = 1
            };

            var result = await _gameService.CheckListeningAnswerAsync(dto);
            var userVoice= await _context.Voices.SingleOrDefaultAsync(w => w.WordId == 1);

            Assert.True(result.IsCorrect);
            Assert.Equal(2, result.Box);
            Assert.NotNull(userVoice!.ListeningNextReview);
            Assert.NotNull(userVoice!.ListeningLastReviewed);
        }

        [Fact]
        public async Task CheckListeningAnswerAsync_VoiceRecordExistsAndUserAnswerWasWrong_Resetsrogress()
        {
            await FillDataBaseListeningAndVoice(true);

            var dto = new ListeningAnswerDto
            {
                UserId = 1,
                DictionaryId = 1,
                Answer = "miss",
                WordId = 1
            };

            var result = await _gameService.CheckListeningAnswerAsync(dto);
            var userVoice = await _context.Voices.SingleOrDefaultAsync(w => w.WordId == 1);

            Assert.False(result.IsCorrect);
            Assert.Equal(0, result.Box);
            Assert.NotNull(userVoice!.ListeningNextReview);
            Assert.NotNull(userVoice!.ListeningLastReviewed);
        }
        #endregion

        #endregion

        #region SpeakingMethods

        #region GetSpeakingQuestionAsync
        [Fact]
        public async Task GetSpeakingQuestionAsync_DictionaryWasNotFound_ThrowsNotFoundException()
        {
            await FillDataBaseListeningAndVoice();

            var dto = new StartGameRequestDto
            {
                DictionaryId = 2,
                UserId = 1
            };

            var exception = await Assert.ThrowsAsync<NotFoundException>(() => _gameService.GetSpeakingQuestionAsync(dto));

            Assert.Equal("Dictionary not found.", exception.Message);
        }

        [Fact]
        public async Task GetSpeakingQuestionAsync_DictionaryExistsAndUserHaveWordForReview_PickWordForGame()
        {
            await FillDataBaseListeningAndVoice();

            var dto = new StartGameRequestDto
            {
                DictionaryId = 1,
                UserId = 1
            };

            var result = await _gameService.GetSpeakingQuestionAsync(dto);

            Assert.NotNull(result);
        }
        [Fact]
        public async Task GetSpeakingQuestionAsync_DictionaryExistsAndUserDoesNotHaveWordForRewiew_ThrowsNotFoundException()
        {
            await FillDataBaseListeningAndVoice(true, false, false);

            var dto = new StartGameRequestDto
            {
                DictionaryId = 1,
                UserId = 1
            };

            var exception = await Assert.ThrowsAnyAsync<NotFoundException>(() => _gameService.GetSpeakingQuestionAsync(dto));

            Assert.Equal("No words available for speaking review.", exception.Message);
        }
        [Fact]
        public async Task GetSpeakingQuestionAsync_DictionaryExistsAndUserLearnedAllWords_ThrowsNotFoundException()
        {
            await FillDataBaseListeningAndVoice(true, true);

            var dto = new StartGameRequestDto
            {
                DictionaryId = 1,
                UserId = 1
            };

            var exception = await Assert.ThrowsAsync<NotFoundException>(() => _gameService.GetSpeakingQuestionAsync(dto));

            Assert.Equal("No words available for speaking review.", exception.Message);
        }
        #endregion
        #region CheckSpeakingAnswerAsync
        [Fact]
        public async Task CheckSpeakingAnswerAsync_VoiceRecordDoesNotExists_ThrowsNotFoundException()
        {
            await FillDataBaseListeningAndVoice();

            var dto = new SpeakingAnswerDto
            {
                UserId = 1,
                DictionaryId = 1,
                WordId = 1,
                Language = "English",
                AudioFile = new FormFile(new MemoryStream([1, 2, 3, 4]), 0, 4, "AudioFile", "test.t") 
                            { Headers = new HeaderDictionary(), ContentType = "test.t" }
            };

            var exception = await Assert.ThrowsAnyAsync<NotFoundException>(() => _gameService.CheckSpeakingAnswerAsync(dto));

            Assert.Equal("Voice record not found.", exception.Message);
        }

        [Fact]
        public async Task CheckSpeakingAnswerAsync_VoiceRecordExistsAndUserScoreIsHigh_UpdatesProgress()
        {
            await FillDataBaseListeningAndVoice(true);

            _MockSpeechRecongnitionService
                .Setup(x => x.RecognizeSpeechAsync(
                    It.IsAny<byte[]>(),
                    It.IsAny<string>(),
                    It.IsAny<string>()))
                .ReturnsAsync(new SpeechRecognitionResult
                {
                    Score = 70
                });

            var dto = new SpeakingAnswerDto
            {
                UserId = 1,
                DictionaryId = 1,
                WordId = 1,
                Language = "English",
                AudioFile = new FormFile(new MemoryStream([1, 2, 3, 4]), 0, 4, "AudioFile", "test.t")
                { Headers = new HeaderDictionary(), ContentType = "test.t" }
            };

            var result = await _gameService.CheckSpeakingAnswerAsync(dto);
            var userVoice = await _context.Voices.SingleOrDefaultAsync(w => w.WordId == 1);

            Assert.True(result.IsCorrect);
            Assert.Equal(2, result.Box);
            Assert.NotNull(userVoice!.SpeakingNextReview);
            Assert.NotNull(userVoice!.SpeakingLastReviewed);
            Assert.True(result.Score >= 70);
        }

        [Fact]
        public async Task CheckSpeakingAnswerAsync_VoiceRecordExistsAndUserAnswerScoreIsLow_ResetsProgress()
        {
            await FillDataBaseListeningAndVoice(true);

            _MockSpeechRecongnitionService
                .Setup(x => x.RecognizeSpeechAsync(
                    It.IsAny<byte[]>(),
                    It.IsAny<string>(),
                    It.IsAny<string>()))
                .ReturnsAsync(new SpeechRecognitionResult
                {
                    Score = 45
                });

            var dto = new SpeakingAnswerDto
            {
                UserId = 1,
                DictionaryId = 1,
                WordId = 1,
                Language = "English",
                AudioFile = new FormFile(new MemoryStream([1, 2, 3, 4]), 0, 4, "AudioFile", "test.t")
                { Headers = new HeaderDictionary(), ContentType = "test.t" }
            };

            var result = await _gameService.CheckSpeakingAnswerAsync(dto);
            var userVoice = await _context.Voices.SingleOrDefaultAsync(w => w.WordId == 1);

            Assert.False(result.IsCorrect);
            Assert.Equal(0, result.Box);
            Assert.NotNull(userVoice!.SpeakingNextReview);
            Assert.NotNull(userVoice!.SpeakingLastReviewed);
            Assert.False(result.Score >= 70);
        }
        #endregion

        #endregion
    }
}
