namespace FlipMemo.Models
{
    public class Word
    {
        public int WordId { get; set; }
        public string ForeignWord { get; set; } = null!;
        public string ForeignPhrase { get; set; }
        public string CroatianWord { get; set; } = null!;
        public string CroatianPhrases { get; set; }
        public string? AudioFile { get; set; }

        public ICollection<Dictionary> Dictionaries { get; set; } = [];
        public ICollection<UserWord> UserWords { get; set; } = [];
        public ICollection<Voice> Voices { get; set; } = [];
    }
}
