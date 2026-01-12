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
using static BCrypt.Net.BCrypt;
using FlipMemo.DTOs.UserAndAuth.Registration;
using FlipMemo.Utils;

namespace FlipMemo.Tests
{
    public class AuthServicesTest
    {
        private readonly IConfiguration configuration;
        private readonly ApplicationDbContext context;
        private readonly Mock<IEmailService> MockMailService = new();
        private readonly Mock<IJwtService> MockJwtService = new();
        private readonly Mock<IWebHostEnvironment> MockWebHostEnvironment = new();
        private readonly AuthService test;

        public AuthServicesTest()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                          .UseInMemoryDatabase(Guid.NewGuid().ToString())
                          .Options;
            context = new ApplicationDbContext(options);

            //upitno, sigurno se moze bolje, ali ako radi nek ostane
            MockWebHostEnvironment.Setup(e => e.ContentRootPath)
                                  .Returns(Path.Combine(Directory.GetCurrentDirectory(),
                                   "..", "..", "..", "..", 
                                   "backend", "FlipMemo"));

            var inMemorySettings = new Dictionary<string, string>
            {
                { "Front:Url", "https://localhost:3000" }
            };
            configuration = new ConfigurationBuilder()
                                .AddInMemoryCollection(inMemorySettings!)
                                .Build();

            MockJwtService.Setup(j => j.GenerateToken(It.IsAny<User>()))
                          .Returns("jwt-fake-token");

            test = new AuthService(
                context,
                MockMailService.Object,
                MockJwtService.Object,
                MockWebHostEnvironment.Object,
                configuration);
        }
        [Fact]
        public async Task RegisterAsync_UserDoesNotExists_CreatesUserAndSendsMail()
        {
            var dto = new RegisterRequestDto
            { 
                Email = "email@example.com" 
            };

            var result = await test.RegisterAsync(dto);

            var user = await context.Users.SingleAsync();

            Assert.Equal(dto.Email.ToLower(), user.Email);
            Assert.Equal(Roles.User, user.Role);
            Assert.NotNull(user.PasswordHash);

            MockMailService.Verify(
                e => e.SendAsync(
                    user.Email,
                    It.IsAny<string>(),
                    null,
                    It.IsAny<string>()),
                    Times.Once);
            
            Assert.Equal(user.Id, result.Id);
        }
    }
}
