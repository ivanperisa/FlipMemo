namespace FlipMemo.Interfaces.External
{
    public interface IPronunciationScorer
    {

        Task<int> GetPronunciationScoreAsync(Stream audioStream);

    }
}
