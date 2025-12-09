using FlipMemo.Models;

namespace FlipMemo.DTOs;

public class StartGameResponseDto
{
    public WordDto? Source {get; set;}
    public List<WordDto>? Targets { get; set;}
    public int? CorrectAnswerId { get; set;}

}