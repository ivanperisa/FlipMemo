namespace FlipMemo.DTOs.WordAndDictionary;

public class GetAllDictionariesResponseDto
{
    public List<DictionaryDto>? Dictionaries { get; set; }
}

public record DictionaryDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Language { get; set; } = null!;
}