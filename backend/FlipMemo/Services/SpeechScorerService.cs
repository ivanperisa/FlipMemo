using FlipMemo.Interfaces;

namespace FlipMemo.Services;

public class SpeechScorerService : ISpeechScorerService
{
    public async Task<int> GetSpeechScoreAsync(string? recognizedText, string expectedText)
    {
        //using var content = new MultipartFormDataContent();
        //var audioContent = new ByteArrayContent(audioFile);

        //audioContent.Headers.ContentType = new MediaTypeHeaderValue("audio/mpeg");
        //audioContent.Headers.ContentDisposition = new ContentDispositionHeaderValue("form-data")
        //{
        //    Name = "\"file\"",
        //    FileName = "\"audio.mp3\""
        //};

        //content.Add(audioContent);

        //var langParam = string.IsNullOrWhiteSpace(language) ? "en" : language;
        //var request = new HttpRequestMessage(HttpMethod.Post, $"transcribe?lang={langParam}&task=transcribe")
        //{
        //    Content = content
        //};

        //var response = await httpClient.SendAsync(request);
        //response.EnsureSuccessStatusCode();

        //var responseString = await response.Content.ReadAsStringAsync();
        //using var document = JsonDocument.Parse(responseString);

        //var recognizedText = string.Empty;
        //if (document.RootElement.TryGetProperty("text", out var textElement))
        //{
        //    recognizedText = textElement.GetString() ?? string.Empty;
        //}

        return CalculateScore(recognizedText, expectedText);
    }

    private static int CalculateScore(string recognizedText, string expectedText)
    {
        if (string.IsNullOrWhiteSpace(recognizedText))
            return 0;

        var similarity = CalculateTextSimilarity(expectedText, recognizedText);
        var wordAccuracy = CalculateWordAccuracy(expectedText, recognizedText);
        var completeness = CalculateCompleteness(expectedText, recognizedText);

        var score = (int)Math.Round(
            similarity * 0.4 +
            wordAccuracy * 0.4 +
            completeness * 0.2
        );

        return Math.Clamp(score, 0, 100);
    }

    private static double CalculateTextSimilarity(string expected, string actual)
    {
        var normalizedExpected = NormalizeText(expected);
        var normalizedActual = NormalizeText(actual);

        var distance = LevenshteinDistance(normalizedExpected, normalizedActual);
        var maxLength = Math.Max(normalizedExpected.Length, normalizedActual.Length);

        return maxLength == 0 ? 100.0 : (1.0 - (double)distance / maxLength) * 100;
    }

    private static double CalculateWordAccuracy(string expected, string actual)
    {
        var expectedWords = NormalizeText(expected)
            .Split(' ', StringSplitOptions.RemoveEmptyEntries);
        var actualWords = NormalizeText(actual)
            .Split(' ', StringSplitOptions.RemoveEmptyEntries);

        if (expectedWords.Length == 0) return 0;

        var correctWords = expectedWords.Intersect(actualWords).Count();
        return (double)correctWords / expectedWords.Length * 100;
    }

    private static double CalculateCompleteness(string expected, string actual)
    {
        var expectedWords = NormalizeText(expected)
            .Split(' ', StringSplitOptions.RemoveEmptyEntries);
        var actualWords = NormalizeText(actual)
            .Split(' ', StringSplitOptions.RemoveEmptyEntries);

        if (expectedWords.Length == 0) return 100;

        var foundWords = expectedWords.Count(ew =>
            actualWords.Any(aw => aw.Contains(ew) || ew.Contains(aw)));

        return (double)foundWords / expectedWords.Length * 100;
    }

    private static string NormalizeText(string text) =>
        text.ToLowerInvariant()
            .Trim()
            .Replace(".", "")
            .Replace(",", "")
            .Replace("?", "")
            .Replace("!", "")
            .Replace("'", "");

    private static int LevenshteinDistance(string s, string t)
    {
        var n = s.Length;
        var m = t.Length;
        var d = new int[n + 1, m + 1];

        if (n == 0) return m;
        if (m == 0) return n;

        for (var i = 0; i <= n; i++) d[i, 0] = i;
        for (var j = 0; j <= m; j++) d[0, j] = j;

        for (var i = 1; i <= n; i++)
        {
            for (var j = 1; j <= m; j++)
            {
                var cost = t[j - 1] == s[i - 1] ? 0 : 1;
                d[i, j] = Math.Min(
                    Math.Min(d[i - 1, j] + 1, d[i, j - 1] + 1),
                    d[i - 1, j - 1] + cost);
            }
        }

        return d[n, m];
    }
}