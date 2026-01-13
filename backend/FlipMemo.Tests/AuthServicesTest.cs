using FlipMemo.Data;
using FlipMemo.DTOs.UserAndAuth;
using FlipMemo.DTOs.UserAndAuth.Login;
using FlipMemo.DTOs.UserAndAuth.Registration;
using FlipMemo.Interfaces;
using FlipMemo.Models;
using FlipMemo.Services;
using FlipMemo.Utils;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Moq;
using SendGrid.Helpers.Errors.Model;
using Xunit;
using NotFoundException = FlipMemo.Utils.NotFoundException;

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

        [Fact]
        public async Task LoginAsync_UserExistsWithCorrectPassword_ReturnsUserAndToken()
        {

            _context.Users.Add(new User
            {
                Email = "email@example.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("correctpassword"),
                Role = Roles.User,
                CreatedAt = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();

            var dto = new LoginRequestDto
            {
                Email = "email@example.com",
                Password = "correctpassword"
            };

            var result = await _authService.LoginAsync(dto);

            var user = await _context.Users.SingleAsync();

            Assert.Equal(dto.Email.ToLower(), result.Email);
            Assert.Equal(Roles.User, result.Role);
            Assert.Equal("jwt-fake-token", result.Token);

            Assert.Equal(user.Id, result.Id);

        }

        [Fact]
        public async Task LoginAsync_UserExistsWithIncorrectPassword_ThrowsUnauthorizedException()
        {

            _context.Users.Add(new User
            {
                Email = "email@example.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("correctpassword"),
                Role = Roles.User,
                CreatedAt = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();

            var dto = new LoginRequestDto
            {
                Email = "email@example.com",
                Password = "wrongpassword"
            };

            var exception = await Assert.ThrowsAsync<UnauthorizedAccessException>(() => _authService.LoginAsync(dto));
            Assert.Equal("Invalid password.", exception.Message);

        }


        [Fact]
        public async Task LoginAsync_UserDoesNotExist_ThrowsNotFoundException()
        {
            var dto = new LoginRequestDto
            {
                Email = "email@example.com",
                Password = "password123"
            };

            var exception = await Assert.ThrowsAsync<NotFoundException>(() => _authService.LoginAsync(dto));
            Assert.Equal("Account doesn't exist.", exception.Message);

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
