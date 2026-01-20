namespace FlipMemo.Utils;

public enum GameModes
{
    TranslateSourceToTarget = 1,
    TranslateTargetToSource = 2,
    Listening = 3,
    Speaking = 4
}

public static class GameModesHelper
{
    private static GameModes[] AllGameModes => Enum.GetValues<GameModes>();

    public static GameModes[] GetAllGameModes => AllGameModes;
}
