using System.Text;
using FlipMemo.Interfaces;

namespace FlipMemo.Services;

public class SpeechScorerService : ISpeechScorerService
{
    public int GetSpeechScoreAsync(string? recognizedText, string expectedText) =>
        CalculateScore(recognizedText ?? string.Empty, expectedText);

    private static int CalculateScore(string recognizedText, string expectedText)
    {
        if (string.IsNullOrWhiteSpace(recognizedText)) return 0;

        var expectedNorm = NormalizeForSpeech(expectedText);
        var actualNorm = NormalizeForSpeech(recognizedText);

        var expectedTokens = Tokenize(expectedNorm);
        var actualTokens = Tokenize(actualNorm, removeFillers: true);

        if (expectedTokens.Length == 0) return 100;

        var wer = ComputeWer(expectedTokens, actualTokens, softMatchThreshold: 0.80, softSubCost: 0.30);
        var werScore = Math.Clamp((1.0 - wer) * 100.0, 0.0, 100.0);

        var coverage = ComputeCoverage(expectedTokens, actualTokens, threshold: 0.80) * 100.0;
        var charSim = ComputeCharSimilarity(expectedNorm, actualNorm);

        var score = (int)Math.Round(
            werScore * 0.70 +
            coverage * 0.20 +
            charSim * 0.10
        );

        return Math.Clamp(score, 0, 100);
    }

    private static string NormalizeForSpeech(string text)
    {
        if (string.IsNullOrWhiteSpace(text)) return string.Empty;
        text = text.ToLowerInvariant();

        var sb = new StringBuilder(text.Length);
        foreach (var ch in text)
            sb.Append(char.IsLetterOrDigit(ch) || char.IsWhiteSpace(ch) ? ch : ' ');

        return CollapseWhitespace(sb.ToString()).Trim();
    }

    private static string[] Tokenize(string normalized, bool removeFillers = false)
    {
        if (string.IsNullOrWhiteSpace(normalized)) return Array.Empty<string>();

        var tokens = normalized.Split(' ', StringSplitOptions.RemoveEmptyEntries);
        if (!removeFillers) return tokens;

        var fillers = new HashSet<string>(StringComparer.Ordinal)
        {
            "um", "uh", "erm", "ah", "eh", "mm", "hmm", "like"
        };

        return tokens.Where(t => !fillers.Contains(t)).ToArray();
    }

    private static string CollapseWhitespace(string s)
    {
        var sb = new StringBuilder(s.Length);
        bool prevSpace = false;

        foreach (var ch in s)
        {
            var isSpace = char.IsWhiteSpace(ch);
            if (isSpace)
            {
                if (!prevSpace) sb.Append(' ');
            }
            else sb.Append(ch);
            prevSpace = isSpace;
        }

        return sb.ToString();
    }

    private static double ComputeWer(string[] expected, string[] actual, double softMatchThreshold, double softSubCost)
    {
        var n = expected.Length;
        var m = actual.Length;

        var dp = new double[n + 1, m + 1];
        for (int i = 0; i <= n; i++) dp[i, 0] = i;
        for (int j = 0; j <= m; j++) dp[0, j] = j;

        for (int i = 1; i <= n; i++)
        {
            for (int j = 1; j <= m; j++)
            {
                var del = dp[i - 1, j] + 1.0;
                var ins = dp[i, j - 1] + 1.0;
                var sub = dp[i - 1, j - 1] + SubstitutionCost(expected[i - 1], actual[j - 1], softMatchThreshold, softSubCost);
                dp[i, j] = Math.Min(Math.Min(del, ins), sub);
            }
        }

        return dp[n, m] / Math.Max(1, n);
    }

    private static double SubstitutionCost(string a, string b, double threshold, double softSubCost)
    {
        if (a == b) return 0.0;
        return WordSimilarity(a, b) >= threshold ? softSubCost : 1.0;
    }

    private static double ComputeCoverage(string[] expected, string[] actual, double threshold)
    {
        if (expected.Length == 0) return 1.0;
        if (actual.Length == 0) return 0.0;

        int found = 0;
        foreach (var ew in expected)
            if (actual.Any(aw => WordSimilarity(ew, aw) >= threshold))
                found++;

        return (double)found / expected.Length;
    }

    private static double ComputeCharSimilarity(string expectedNorm, string actualNorm)
    {
        if (string.IsNullOrEmpty(expectedNorm) && string.IsNullOrEmpty(actualNorm)) return 100.0;
        if (string.IsNullOrEmpty(expectedNorm) || string.IsNullOrEmpty(actualNorm)) return 0.0;

        var dist = LevenshteinDistance(expectedNorm, actualNorm);
        var maxLen = Math.Max(expectedNorm.Length, actualNorm.Length);

        return maxLen == 0 ? 100.0 : (1.0 - (double)dist / maxLen) * 100.0;
    }

    private static double WordSimilarity(string a, string b)
    {
        if (string.IsNullOrEmpty(a) || string.IsNullOrEmpty(b)) return 0.0;
        if (a == b) return 1.0;

        var dist = LevenshteinDistance(a, b);
        var maxLen = Math.Max(a.Length, b.Length);

        return maxLen == 0 ? 1.0 : 1.0 - (double)dist / maxLen;
    }

    private static int LevenshteinDistance(string s, string t)
    {
        var n = s.Length;
        var m = t.Length;

        if (n == 0) return m;
        if (m == 0) return n;

        var d = new int[n + 1, m + 1];
        for (var i = 0; i <= n; i++) d[i, 0] = i;
        for (var j = 0; j <= m; j++) d[0, j] = j;

        for (var i = 1; i <= n; i++)
        {
            for (var j = 1; j <= m; j++)
            {
                var cost = s[i - 1] == t[j - 1] ? 0 : 1;
                d[i, j] = Math.Min(
                    Math.Min(d[i - 1, j] + 1, d[i, j - 1] + 1),
                    d[i - 1, j - 1] + cost
                );
            }
        }

        return d[n, m];
    }
}
