import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

// Game mode type
export type GameMode = 'translate-from' | 'translate-to' | 'listening' | 'speaking';

// Storage keys
const STORAGE_KEYS = {
    DICTIONARY_ID: 'flipmemo_dictionaryId',
    GAME_MODE: 'flipmemo_gameMode',
} as const;

interface LearningContextType {
    // Dictionary ID
    dictionaryId: string | null;
    setDictionaryId: (id: string | null) => void;
    
    // Game Mode
    gameMode: GameMode | null;
    setGameMode: (mode: GameMode | null) => void;
}

interface LearningProviderProps {
    children: ReactNode;
}

// Helper functions for localStorage
const getStoredDictionaryId = (): string | null => {
    try {
        return localStorage.getItem(STORAGE_KEYS.DICTIONARY_ID);
    } catch {
        return null;
    }
};

const getStoredGameMode = (): GameMode | null => {
    try {
        const stored = localStorage.getItem(STORAGE_KEYS.GAME_MODE);
        if (stored && ['translate-from', 'translate-to', 'listening', 'speaking'].includes(stored)) {
            return stored as GameMode;
        }
        return null;
    } catch {
        return null;
    }
};

// Create Context
const LearningContext = createContext<LearningContextType | undefined>(undefined);

// Provider Component
export const LearningProvider = ({ children }: LearningProviderProps) => {
    const [dictionaryId, setDictionaryIdState] = useState<string | null>(getStoredDictionaryId);
    const [gameMode, setGameModeState] = useState<GameMode | null>(getStoredGameMode);

    // Wrapper for setDictionaryId that also persists to localStorage
    const setDictionaryId = (id: string | null) => {
        setDictionaryIdState(id);
        try {
            if (id) {
                localStorage.setItem(STORAGE_KEYS.DICTIONARY_ID, id);
            } else {
                localStorage.removeItem(STORAGE_KEYS.DICTIONARY_ID);
            }
        } catch (e) {
            console.error('Failed to save dictionaryId to localStorage:', e);
        }
    };

    // Wrapper for setGameMode that also persists to localStorage
    const setGameMode = (mode: GameMode | null) => {
        setGameModeState(mode);
        try {
            if (mode) {
                localStorage.setItem(STORAGE_KEYS.GAME_MODE, mode);
            } else {
                localStorage.removeItem(STORAGE_KEYS.GAME_MODE);
            }
        } catch (e) {
            console.error('Failed to save gameMode to localStorage:', e);
        }
    };

    const contextValue = {
        dictionaryId,
        setDictionaryId,
        gameMode,
        setGameMode,
    };

    return (
        <LearningContext.Provider value={contextValue}>
            {children}
        </LearningContext.Provider>
    );
};

// Custom Hook
export const useLearning = (): LearningContextType => {
    const context = useContext(LearningContext);
    if (context === undefined) {
        throw new Error('useLearning must be used within a LearningProvider');
    }
    return context;
};