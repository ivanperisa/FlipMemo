export type FrontendGameMode = 'translate-from' | 'translate-to' | 'listening' | 'speaking';

export const BackendGameModes = {
    TranslateSourceToTarget: 1,
    TranslateTargetToSource: 2,
    Listening: 3,
    Speaking: 4,
} as const;

export function mapGameModeToBackend(mode: FrontendGameMode | null | undefined): number | null {
    if (!mode) return null;
    switch (mode) {
        case 'translate-from':
            return BackendGameModes.TranslateSourceToTarget;
        case 'translate-to':
            return BackendGameModes.TranslateTargetToSource;
        case 'listening':
            return BackendGameModes.Listening;
        case 'speaking':
            return BackendGameModes.Speaking;
        default:
            return null;
    }
}

export default mapGameModeToBackend;
