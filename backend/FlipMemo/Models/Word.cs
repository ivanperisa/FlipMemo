namespace FlipMemo.Models;

public class Word
{
    public int WordId { get; set; }
    public string ForeignWord { get; set; } = null!;
    public string ForeignPhrase { get; set; } = null!;
    public string CroatianWord { get; set; } = null!;
    public string CroatianPhrases { get; set; } = null!;
    public string? AudioFile { get; set; }  //ovo moze bit null jer to cemo kasnije dodat ili necemo opce dodavat neznam iskreno
                //ali zasad moze bit null da nas ne jebe

    public ICollection<Dictionary> Dictionaries { get; set; } = new List<Dictionary>();
}
