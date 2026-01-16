namespace FlipMemo.Models;

public class Word
{
    public int Id { get; set; }
    public string SourceWord { get; set; } = null!;
    public List<string>? SourcePhrases { get; set; }
    public string? TargetWord { get; set; }
    public List<string>? TargetPhrases { get; set; }
    public byte[]? AudioFile { get; set; }

    public ICollection<Dictionary> Dictionaries { get; set; } = [];
    public ICollection<UserWord> UserWords { get; set; } = [];
    public ICollection<Voice> Voices { get; set; } = [];
}
