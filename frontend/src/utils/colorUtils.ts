// Helper funkcije za manipulaciju boja

/**
 * Pretvara hex boju u RGB objekt
 */
export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
};

/**
 * Pretvara RGB vrijednosti u hex boju
 */
export const rgbToHex = (r: number, g: number, b: number): string => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
};

/**
 * Zatamnjuje boju za određeni postotak
 */
export const darkenColor = (hex: string, percent: number): string => {
    const rgb = hexToRgb(hex);
    if (!rgb) return hex;
    
    const factor = 1 - (percent / 100);
    return rgbToHex(
        Math.max(0, Math.round(rgb.r * factor)),
        Math.max(0, Math.round(rgb.g * factor)),
        Math.max(0, Math.round(rgb.b * factor))
    );
};

/**
 * Posvijetljuje boju za određeni postotak
 */
export const lightenColor = (hex: string, percent: number): string => {
    const rgb = hexToRgb(hex);
    if (!rgb) return hex;
    
    const factor = percent / 100;
    return rgbToHex(
        Math.min(255, Math.round(rgb.r + (255 - rgb.r) * factor)),
        Math.min(255, Math.round(rgb.g + (255 - rgb.g) * factor)),
        Math.min(255, Math.round(rgb.b + (255 - rgb.b) * factor))
    );
};

/**
 * Generira gradient end boju iz početne boje
 */
export const generateGradientEnd = (startColor: string): string => {
    return lightenColor(startColor, 25);
};

/**
 * Izračunava relativnu luminance boje prema WCAG standardu
 * https://www.w3.org/TR/WCAG20-TECHS/G17.html
 */
export const getLuminance = (hex: string): number => {
    const rgb = hexToRgb(hex);
    if (!rgb) return 0;
    
    // Normaliziraj RGB vrijednosti
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;
    
    // Primijeni gamma korekciju
    const rLinear = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
    const gLinear = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
    const bLinear = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
    
    // Izračunaj luminance
    return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
};

/**
 * Određuje da li treba koristiti bijeli ili crni tekst na pozadini dane boje
 * Vraća '#FFFFFF' za bijeli ili '#000000' za crni tekst
 */
export const getContrastColor = (backgroundColor: string): string => {
    const luminance = getLuminance(backgroundColor);
    
    // Ako je pozadina svijetla (luminance > 0.5), koristi crni tekst
    // Inače koristi bijeli tekst
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

/**
 * Izračunava contrast ratio između dvije boje prema WCAG standardu
 */
export const getContrastRatio = (color1: string, color2: string): number => {
    const lum1 = getLuminance(color1);
    const lum2 = getLuminance(color2);
    
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    
    return (lighter + 0.05) / (darker + 0.05);
};
