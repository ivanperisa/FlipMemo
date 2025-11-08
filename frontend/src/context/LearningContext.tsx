import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

// Interfaces
interface WordSet {
    id: string;
    name: string;
    words: string[];
}



interface LearningMode {
    id: 'translate-from' | 'translate-to' | 'listening' | 'speaking';
    label: string;
    completed: boolean;
    score?: number;
}

interface ModeProgress {
    [modeId: string]: {
        wordsCompleted: string[];
        score: number;
    }
}

interface LearningContextType {
    // Word Set
    selectedWordSet: WordSet | null;
    setSelectedWordSet: (set: WordSet) => void;
    
    // Current Mode
    currentMode: LearningMode | null;
    setCurrentMode: (mode: LearningMode) => void;
    
    // Progress tracking
    modeProgress: ModeProgress;
    
    // Mark word as learned in current mode
    markWordCompleted: (wordId: string) => void;
    
    // Check if word is completed in current mode
    isWordCompleted: (wordId: string, modeId: string) => boolean;
    
    // Overall progress
    getOverallProgress: () => number;
}

interface LearningProviderProps {
    children: ReactNode;
}

// Create Context
const LearningContext = createContext<LearningContextType | undefined>(undefined);

// Provider Component
export const LearningProvider = ({ children }: LearningProviderProps) => {
    const [selectedWordSet, setSelectedWordSet] = useState<WordSet | null>(null);
    const [currentMode, setCurrentMode] = useState<LearningMode | null>(null);
    const [modeProgress, setModeProgress] = useState<ModeProgress>({
        'translate-from': { wordsCompleted: [], score: 0 },
        'translate-to': { wordsCompleted: [], score: 0 },
        'listening': { wordsCompleted: [], score: 0 },
        'speaking': { wordsCompleted: [], score: 0 },
    });

    const markWordCompleted = (wordId: string) => {
        if (!currentMode) return;
        
        setModeProgress(prev => ({
            ...prev,
            [currentMode.id]: {
                ...prev[currentMode.id],
                wordsCompleted: [...prev[currentMode.id].wordsCompleted, wordId]
            }
        }));
    };

    const isWordCompleted = (wordId: string, modeId: string): boolean => {
        return modeProgress[modeId]?.wordsCompleted.includes(wordId) || false;
    };

    const getOverallProgress = (): number => {
        if (!selectedWordSet || selectedWordSet.words.length === 0) return 0;
        
        const totalWords = selectedWordSet.words.length;
        const totalModes = 4;
        const totalPossible = totalWords * totalModes;
        
        let totalCompleted = 0;
        Object.values(modeProgress).forEach(progress => {
            totalCompleted += progress.wordsCompleted.length;
        });
        
        return Math.round((totalCompleted / totalPossible) * 100);
    };

    const contextValue = {
        selectedWordSet,
        setSelectedWordSet,
        currentMode,
        setCurrentMode,
        modeProgress,
        markWordCompleted,
        isWordCompleted,
        getOverallProgress,
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