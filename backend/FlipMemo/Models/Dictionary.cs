namespace FlipMemo.Models;

public class Dictionary
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Language { get; set; } = null!;

    public ICollection<Word> Words { get; set; }
}
