namespace FlipMemo.DTOs.WordAndDictionary
{
    public class ChangeWordPhrasesDto
    {
        public int Id { get; set; }
        public List<string>? SourcePhrases { get; set; }
        public List<string>? TargetPhrases { get; set; }
    }
}
