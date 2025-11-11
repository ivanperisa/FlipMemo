using FlipMemo.Interfaces;
using FlipMemo.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace FlipMemo.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class UserController(IUserService userService) : ControllerBase
{
    [HttpGet]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetAllUsers()
    {
        var users = await userService.GetAllUsersAsync();
        return Ok(users);
    }

    [HttpGet("{id}")]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetUserById(int id)
    {
        var user = await userService.GetUserByIdAsync(id);
        return Ok(user);
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "UserOrAdmin")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> DeleteUser(int id)
    {
        var userIdClaim = User.FindFirst("userId")?.Value;
        var currentUserId = int.Parse(userIdClaim!);
        var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

        if (userRole == Roles.User && currentUserId != id)
            throw new ForbiddenException("You can only delete your own account.");

        if (userRole == Roles.Admin && currentUserId == id)
            throw new ForbiddenException("You can't delete your own account.");

        await userService.DeleteUserAsync(id);
        return Ok(new { message = "User deleted successfully." });
    }

    [HttpPut("{id}/promote")]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> Promote(int id)
    {
        var userIdClaim = User.FindFirst("userId")?.Value;
        var currentUserId = int.Parse(userIdClaim!);

        if (currentUserId == id)
            throw new ForbiddenException("You can't change your own role.");

        await userService.ChangeRole(id, "Promote");

        return Ok(new { message = "User promoted successfully." });

    }

    [HttpPut("{id}/demote")]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> Demote(int id)
    {
        var userIdClaim = User.FindFirst("userId")?.Value;
        var currentUserId = int.Parse(userIdClaim!);

        if (currentUserId == id)
            throw new ForbiddenException("You can't change your own role.");

        await userService.ChangeRole(id, "Demote");

        return Ok(new { message = "User demoted successfully." });
    }
}