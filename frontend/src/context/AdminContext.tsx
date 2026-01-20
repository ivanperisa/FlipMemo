import {createContext, useContext, useMemo, useState} from "react";
import React from "react";

interface Dictionary {
    id: number;
    name: string;
    language: string;
}

interface Word {
    id: number;
    sourceWord: string;
    sourcePhrases: string[];
    targetWord: string;
    targetPhrases: string[];
}

interface AdminContextType {
    selectedDictionary: Dictionary | null;
    selectedWord: Word | null;
    setSelectedDictionary: (dictionary: Dictionary | null) => void;
    setSelectedWord: (word: Word |null) => void;
}

interface AdminProviderProps {
    children: React.ReactNode;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

const AdminProvider = ({ children }: AdminProviderProps) => {

    const getInitialSelectedDictionary = (): Dictionary | null => {
        const saved = sessionStorage.getItem("adminDict");
        if (!saved) return null;
        try {
            return JSON.parse(saved) as Dictionary
        } catch {
            console.log("Admin selected dictionary from session storage parsing failed");
            return null;
        }
    };

    const getInitialSelectedWord = (): Word | null => {
        const saved = sessionStorage.getItem("adminWord");
        if (!saved) return null;
        try {
            return JSON.parse(saved) as Word;
        } catch {
            console.log("Admin selected word from session storage parsing failed");
            return null;
        }
    };

    const [selectedDictionary, setSelectedDictionary_] = useState<Dictionary | null>(getInitialSelectedDictionary());
    const [selectedWord, setSelectedWord_] = useState<Word | null>(getInitialSelectedWord());

    const setSelectedDictionary = (dictionary: Dictionary | null) => {
        setSelectedDictionary_(dictionary);
        sessionStorage.setItem("adminDict", JSON.stringify(dictionary));
    }

    const setSelectedWord = (word: Word | null) => {
        setSelectedWord_(word);
        sessionStorage.setItem("adminWord", JSON.stringify(word));
    }

    const contextValue = useMemo(
        () => ({
            selectedDictionary,
            selectedWord,
            setSelectedDictionary,
            setSelectedWord
        }),
        [selectedDictionary, selectedWord]
    );

    return (
        <AdminContext.Provider value={contextValue}>{children}</AdminContext.Provider>
    );
}

    export const useAdminContext = (): AdminContextType => {
        const context = useContext(AdminContext);
        if (context === undefined) {
            throw new Error('useAdminContext must be used within an AdminContext Provider');
        }
        return context;
    };

    export default AdminProvider;

