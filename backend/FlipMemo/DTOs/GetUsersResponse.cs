namespace FlipMemo.DTOs;

public class GetUsersResponse
{
    public required IEnumerable<UserDto> Users { get; set; }
}
public record UserDto
{
    public int Id { get; set; }
    public required string Username { get; set; }
    public required string Email { get; set; }
}