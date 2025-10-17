namespace FlipMemo.Models;

public class Word
{
    public int Id { get; set; }
    public string EnglishWord { get; set; } = null!;
    public string EnglishPhrases { get; set; } = null!;
    public string CroatianWord { get; set; } = null!;
    public string CroatianPhrases { get; set; } = null!;
    public string? AudioFilePath { get; set; }  //ovo moze bit null jer to cemo kasnije dodat ili necemo opce dodavat neznam iskreno
                //ali zasad moze bit null da nas ne jebe

    public ICollection<Dictionary> Dictionaries { get; set; } = new List<Dictionary>();
}
