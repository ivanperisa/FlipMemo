using FlipMemo.Data;
using FlipMemo.DTOs.WordAndDictionary;
using FlipMemo.Models;
using FlipMemo.Services;
using FlipMemo.Utils;
using Microsoft.EntityFrameworkCore;

namespace FlipMemo.Tests
{
    public class DictionaryServicesTest
    {
        private readonly ApplicationDbContext _context;
        private readonly DictionaryService _dictionaryService;

        public DictionaryServicesTest()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;
            _context = new ApplicationDbContext(options);

            _dictionaryService = new DictionaryService(_context);
        }

        [Fact]
        public async Task CreateDictionaryAsync_DictionaryDoesNotExist_CreatesDictionary()
        {

            var dto = new CreateDictionaryRequestDto
            {
                Name = "Test Dictionary",
                Language = "English"
            };

            await _dictionaryService.CreateDictionaryAsync(dto);

            var createdDictionary = await _context.Dictionaries.SingleAsync();

            Assert.Equal("Test Dictionary", createdDictionary.Name);
            Assert.Equal("English", createdDictionary.Language);

        }

        [Fact]
        public async Task CreateDictionaryAsync_DictionaryAlreadyExists_ThrowsConflictException()
        {

            _context.Dictionaries.Add(new Dictionary
            {
                Name = "Existing Dictionary",
                Language = "English"
            });

            await _context.SaveChangesAsync();

            var dto = new CreateDictionaryRequestDto
            {
                Name = "Existing Dictionary",
                Language = "English"
            };

            var exception = await Assert.ThrowsAsync<ConflictException>(() => _dictionaryService.CreateDictionaryAsync(dto));
            Assert.Equal("Dictionary already exists.", exception.Message);
        }

        [Fact]
        public async Task GetWordsFromDictionaryAsync_DictionaryDoesNotHaveAnyWords_ThrowsNotFoundException()
        {

            _context.Dictionaries.Add(new Dictionary
            {
                Name = "Empty Dictionary",
                Language = "English"
            });

            await _context.SaveChangesAsync();
            var dictionary = await _context.Dictionaries.SingleAsync();

            var exception = await Assert.ThrowsAsync<NotFoundException>(() => _dictionaryService.GetWordsFromDictionaryAsync(dictionary.Id));
            Assert.Equal("Dictionary doesn't have any words.", exception.Message);
        }

        [Fact]
        public async Task RemoveWordFromDictionaryAsync_DictionaryHasTheWord_RemovesWordFromDictionary()
        {
            var word = new Word
            {
                SourceWord = "Hello",
                TargetWord = "Hola"
            };

            var dictionary = new Dictionary
            {
                Name = "Test Dictionary",
                Language = "English",
                Words = new List<Word> { word }
            };

            _context.Dictionaries.Add(dictionary);

            await _context.SaveChangesAsync();
            await _dictionaryService.RemoveWordFromDictionaryAsync(dictionary.Id, word.Id);

            var updatedDictionary = await _context.Dictionaries
                .Include(d => d.Words)
                .SingleAsync(d => d.Id == dictionary.Id);

            Assert.Empty(updatedDictionary.Words);
        }

        [Fact]
        public async Task AddWordsToDictionariesAsync_WordAndDictionariesExist_AddsWordToDictionaries()
        {
            var word = new Word
            {
                SourceWord = "Hello",
                TargetWord = "Hola"
            };
            _context.Words.Add(word);

            var dictionary1 = new Dictionary
            {
                Name = "Dictionary 1",
                Language = "English"
            };
            var dictionary2 = new Dictionary
            {
                Name = "Dictionary 2",
                Language = "English"
            };
            _context.Dictionaries.AddRange(dictionary1, dictionary2);

            await _context.SaveChangesAsync();

            var dto = new AddWordToDictionariesRequestDto
            {
                DictionaryIds = new List<int> { dictionary1.Id, dictionary2.Id }
            };

            await _dictionaryService.AddWordToDictionariesAsync(word.Id, dto);

            var updatedDictionary1 = await _context.Dictionaries
                .Include(d => d.Words)
                .SingleAsync(d => d.Id == dictionary1.Id);
            var updatedDictionary2 = await _context.Dictionaries
                .Include(d => d.Words)
                .SingleAsync(d => d.Id == dictionary2.Id);

            Assert.Contains(updatedDictionary1.Words, w => w.Id == word.Id);
            Assert.Contains(updatedDictionary2.Words, w => w.Id == word.Id);
        }
    }
}
