import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { darkenColor, lightenColor, generateGradientEnd, getContrastColor } from "../utils/colorUtils";

interface Theme {
    id: string;
    name: string;
    color: string;
}

interface ThemeContextType {
    primaryColor: string;
    setPrimaryColor: (color: string) => void;
    themes: Theme[];
    applyTheme: (themeId: string) => void;
}

interface ThemeProviderProps {
    children: ReactNode;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Preddefinirane teme
const DEFAULT_THEMES: Theme[] = [
    { id: 'pink', name: 'Roza', color: '#F0A2A5' },
    { id: 'blue', name: 'Plava', color: '#A0C4FF' },
    { id: 'green', name: 'Zelena', color: '#A8E6CF' }

];

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
    // Učitaj iz localStorage ili koristi default
    const [primaryColor, setPrimaryColor_] = useState<string>(() => {
        return localStorage.getItem('theme-primary') || '#F0A2A5';
    });

    // Funkcija koja updatea CSS variables
    const updateCSSVariables = (color: string) => {
        const root = document.documentElement;
        
        // Glavna boja
        root.style.setProperty('--color-primary', color);
        
        // Tamnija varijanta (za gumbove, hover efekte) - povećano sa 25% na 45%
        const darkerColor = darkenColor(color, 25);
        root.style.setProperty('--color-primary-dark', darkerColor);
        
        // Još tamnija varijanta (za SVG lice da se jasno vidi)
        const extraDarkColor = darkenColor(color, 30);
        root.style.setProperty('--color-primary-extra-dark', extraDarkColor);
        
        // Svjetlija varijanta (za pozadine, oči SVG-a)
        const lighterColor = lightenColor(color, 35);
        root.style.setProperty('--color-primary-light', lighterColor);
        
        // Gradient boje
        root.style.setProperty('--color-gradient-start', color);
        root.style.setProperty('--color-gradient-end', generateGradientEnd(color));
        
        // SVG boje - koristi tamniju varijantu za bolje kontraste
        root.style.setProperty('--color-face', extraDarkColor);
        root.style.setProperty('--color-eye', lighterColor);
        
        // Tekstualne boje - automatski odabir bijelog ili crnog teksta
        const textOnPrimary = getContrastColor(color);
        const textOnDark = getContrastColor(darkerColor);
        root.style.setProperty('--color-text-on-primary', textOnPrimary);
        root.style.setProperty('--color-text-on-dark', textOnDark);
    };

    // Postavi boju i spremi u localStorage
    const setPrimaryColor = (color: string) => {
        setPrimaryColor_(color);
        localStorage.setItem('theme-primary', color);
        updateCSSVariables(color);
    };

    // Primijeni predefiniranu temu
    const applyTheme = (themeId: string) => {
        const theme = DEFAULT_THEMES.find(t => t.id === themeId);
        if (theme) {
            setPrimaryColor(theme.color);
        }
    };

    // Inicijaliziraj CSS variables na mount
    useEffect(() => {
        updateCSSVariables(primaryColor);
    }, []);

    const contextValue = {
        primaryColor,
        setPrimaryColor,
        themes: DEFAULT_THEMES,
        applyTheme,
    };

    return (
        <ThemeContext.Provider value={contextValue}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
