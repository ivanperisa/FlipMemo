using FlipMemo.Interfaces.External;

namespace FlipMemo.Services.External
{
    public class PronunciationScorer : IPronunciationScorer
    {

        private readonly Random _random = new Random();

        public async Task<int> GetPronunciationScoreAsync(Stream audioStream)
        {
            // simuliraj kasnjenje
            await Task.Delay(50);
            
            int score = _random.Next(0, 11);

            audioStream.Seek(0, SeekOrigin.Begin);

            return score;
        }
    }
}
