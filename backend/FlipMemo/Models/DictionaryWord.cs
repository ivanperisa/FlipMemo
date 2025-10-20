namespace FlipMemo.Models;

public class DictionaryWord
{
    public int DictionaryId { get; set; }
    public int WordId { get; set; }

    public Dictionary Dictionary { get; set; }
    public Word Word { get; set; }
}
