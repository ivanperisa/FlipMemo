using FlipMemo.Data;
using FlipMemo.DTOs.UserAndAuth;
using FlipMemo.Interfaces;
using FlipMemo.Services;
using FlipMemo.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Hosting;
using Moq;
using Xunit;
using FlipMemo.DTOs.UserAndAuth.Registration;
using FlipMemo.Utils;

namespace FlipMemo.Tests
{
    public class AuthServicesTest
    {
        private readonly ApplicationDbContext _context;
        private readonly Mock<IEmailService> _mockEmailService;
        private readonly Mock<IJwtService> _mockJwtService;
        private readonly Mock<IWebHostEnvironment> _mockWebHostEnvironment;
        private readonly IConfiguration _configuration;
        private readonly AuthService _authService;

        public AuthServicesTest()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;
            _context = new ApplicationDbContext(options);

            _mockEmailService = new Mock<IEmailService>();
            _mockJwtService = new Mock<IJwtService>();
            _mockWebHostEnvironment = new Mock<IWebHostEnvironment>();

            var projectRoot = GetProjectRoot();
            _mockWebHostEnvironment.Setup(e => e.ContentRootPath)
                .Returns(Path.Combine(projectRoot, "FlipMemo"));

            var inMemorySettings = new Dictionary<string, string>
            {
                { "Front:Url", "https://localhost:3000" }
            };
            _configuration = new ConfigurationBuilder()
                .AddInMemoryCollection(inMemorySettings!)
                .Build();

            _mockJwtService.Setup(j => j.GenerateToken(It.IsAny<User>()))
                .Returns("jwt-fake-token");

            _authService = new AuthService(
                _context,
                _mockEmailService.Object,
                _mockJwtService.Object,
                _mockWebHostEnvironment.Object,
                _configuration);
        }

        [Fact]
        public async Task RegisterAsync_UserDoesNotExist_CreatesUserAndSendsMail()
        {
            var dto = new RegisterRequestDto
            {
                Email = "email@example.com"
            };

            var result = await _authService.RegisterAsync(dto);

            var user = await _context.Users.SingleAsync();

            Assert.Equal(dto.Email.ToLower(), user.Email);
            Assert.Equal(Roles.User, user.Role);
            Assert.NotNull(user.PasswordHash);

            _mockEmailService.Verify(
                e => e.SendAsync(
                    user.Email,
                    It.IsAny<string>(),
                    null,
                    It.IsAny<string>()),
                Times.Once);

            Assert.Equal(user.Id, result.Id);
        }

        private static string GetProjectRoot()
        {
            var currentDirectory = Directory.GetCurrentDirectory();
            var directory = new DirectoryInfo(currentDirectory);

            while (directory != null && !Directory.Exists(Path.Combine(directory.FullName, "FlipMemo")))
            {
                directory = directory.Parent;
            }

            if (directory == null)
            {
                throw new InvalidOperationException("Could not find project root directory containing 'FlipMemo' folder.");
            }

            return directory.FullName;
        }
    }
}
