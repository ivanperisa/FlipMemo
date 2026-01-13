using FlipMemo.Data;
using FlipMemo.DTOs.WordAndDictionary;
using FlipMemo.Models;
using FlipMemo.Services;
using FlipMemo.Utils;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

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
    }
}
