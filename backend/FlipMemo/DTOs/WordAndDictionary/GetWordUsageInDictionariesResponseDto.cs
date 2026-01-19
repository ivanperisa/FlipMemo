namespace FlipMemo.DTOs.WordAndDictionary
{
    public class GetWordUsageInDictionariesResponseDto
    {
        public List<WordDictionaryUsageDto> Dictionaries { get; set; }
    }

    public class WordDictionaryUsageDto
    {
        public int DictionaryId { get; set; }
        public string DictionaryName { get; set; } = null!;
    }
}