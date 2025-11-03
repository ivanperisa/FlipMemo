using FlipMemo.Data;
using FlipMemo.DTOs;
using FlipMemo.Interfaces;
using FlipMemo.Services;
using FlipMemo.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using System.Security.Claims;
using System.Security.Cryptography;

namespace FlipMemo.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class AuthController(IAuthService authService, IJwtService jwtService, ApplicationDbContext dbContext) : ControllerBase
{
    private readonly IAuthService _authService = authService;
    private readonly IJwtService _jwtService = jwtService;
    private readonly ApplicationDbContext _dbContext = dbContext;

    [HttpPost("register")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> Register([FromBody] RegisterRequestDto dto)
    {
        var user = await authService.RegisterAsync(dto);

        return CreatedAtAction(nameof(Register), 
            new { message = "User registered successfully. Check your email for login credentials." });
    }

    [HttpPost("login")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto dto)
    {
        var userDto = await authService.LoginAsync(dto);
        if (userDto == null)
            return Unauthorized(new { message = "Invalid credentials." });

        var user = await _dbContext.Users.FindAsync(userDto.Id);
        if (user == null)
            return Unauthorized();

        var jwtToken = _jwtService.GenerateToken(user);

        var isDevelopment = HttpContext.RequestServices.GetRequiredService<IWebHostEnvironment>().IsDevelopment();

        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = !isDevelopment,
            SameSite = SameSiteMode.Lax,
            Expires = DateTime.UtcNow.AddMinutes(15),
            Path = "/",
            IsEssential = true
        };

        Response.Cookies.Append("accessToken", jwtToken, cookieOptions);

        return Ok(new
        {
            message = "Login successful",
            user = new
            {
                userDto.Id,
                userDto.Email,
                userDto.MustChangePassword
            }
        });
    }

    [HttpPost("logout")]
    [Authorize(Policy = "UserOrAdmin")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> Logout()
    {
        var userIdClaim = User.FindFirst("userId")?.Value;

        if (!int.TryParse(userIdClaim, out var userId))
            throw new UnauthorizedAccessException("Authentication required.");

        await authService.LogoutAsync(userId);

        var isDevelopment = HttpContext.RequestServices.GetRequiredService<IWebHostEnvironment>().IsDevelopment();

        Response.Cookies.Delete("accessToken", new CookieOptions
        {
            HttpOnly = true,
            Secure = !isDevelopment,
            SameSite = SameSiteMode.Lax,
            Path = "/"
        });

        return Ok(new { message = "Logged out successfully." });
    }

    [HttpPut("{id}/change-password")]
    [Authorize(Policy = "UserOrAdmin")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> ChangePassword(int id, [FromBody] ChangePasswordRequestDto dto)
    {
        var userIdClaim = User.FindFirst("userId")?.Value;
        var currentUserId = int.Parse(userIdClaim!);
        var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

        if (userRole == "User" && currentUserId != id)
            throw new ForbiddenException("You can only change your own password.");

        await authService.ChangePasswordAsync(id, dto);

        return Ok(new { message = "Password changed successfully." });
    }

    [HttpPost("forgot-password")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequestDto dto)
    {
        var bytes = new byte[32];
        RandomNumberGenerator.Fill(bytes);

        string resetToken = WebEncoders.Base64UrlEncode(bytes);
        var resetUrl = Url.Action("ResetPassword", "Auth", new {dto.Email, Token = resetToken}, "http");

        await authService.ForgotPasswordAsync(dto, resetUrl!, resetToken);

        return Ok(new { message = "If the email exists, a password reset token has been sent." });
    }

    [HttpPost("reset-password")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> ResetPassword([FromQuery] ResetPasswordQueryDto queryDto, [FromBody] ResetPasswordBodyDto bodyDto)
    {
        await authService.ResetPasswordAsync(queryDto, bodyDto);

        return Ok(new { message = "Password reset successfully." });
    }
}