namespace FlipMemo.Models;

public class Word
{
    public int Id { get; set; }
    public string ForeignWord { get; set; } = null!;
    public string? ForeignPhrase { get; set; }
    public string? CroatianWord { get; set; }
    public string? CroatianPhrases { get; set; }
    public string? AudioFile { get; set; }

    public ICollection<Dictionary> Dictionaries { get; set; } = null!;
    public ICollection<UserWord> UserWords { get; set; } = null!;
    public ICollection<Voice> Voices { get; set; } = null!;
}
