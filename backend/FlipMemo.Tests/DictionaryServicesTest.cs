using FlipMemo.Data;
using FlipMemo.Services;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FlipMemo.Tests
{
    internal class DictionaryServicesTest
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
    }
}
