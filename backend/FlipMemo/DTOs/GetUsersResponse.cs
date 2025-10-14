namespace FlipMemo.DTOs;

public class GetUsersResponse
{
    public IEnumerable<UserDto> Users { get; set; }
}

public record UserDto
{
    public int Id { get; set; }
    public string Username { get; set; }
    public string Email { get; set; }
}