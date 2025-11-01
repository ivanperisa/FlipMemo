using FlipMemo.Models;

namespace FlipMemo.Interfaces;

public interface IJwtService
{
    string GenerateToken(User user);
}
