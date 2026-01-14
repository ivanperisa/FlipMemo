using FlipMemo.Data;
using FlipMemo.DTOs.Game;
using FlipMemo.DTOs.UserAndAuth;
using FlipMemo.DTOs.UserAndAuth.Login;
using FlipMemo.DTOs.UserAndAuth.Registration;
using FlipMemo.Interfaces;
using FlipMemo.Interfaces.External;
using FlipMemo.Models;
using FlipMemo.Services;
using FlipMemo.Utils;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
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
        internal async Task FillDataBase()
        {
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

            await _context.Users.AddAsync(new User
            {
                CreatedAt = DateTime.Now,
                Email = "example@email.com",
                Id = 1,
                MustChangePassword = false,
                Role = Roles.User
            });

            await _context.Words.AddRangeAsync(Words);

            await _context.SaveChangesAsync();
        }
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

        public async Task GetQuestionAsync_DictionaryExistsAndUserHaveWord_PickWordsForGame()
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
    }
}
