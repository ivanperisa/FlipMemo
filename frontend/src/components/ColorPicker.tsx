import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { BgColorsOutlined } from "@ant-design/icons";

const ColorPicker = () => {
    const { primaryColor, setPrimaryColor, themes } = useTheme();
    const [showCustomPicker, setShowCustomPicker] = useState(false);

    return (
        <div className="p-4 min-w-[280px]">
            {/* Naslov */}
            <div className="flex items-center gap-2 mb-4">
                <BgColorsOutlined style={{ fontSize: '18px' }} />
                <h3 className="font-space font-semibold text-[#8B6B7A]">
                    Odaberi temu
                </h3>
            </div>

            {/* Preddefinirane teme */}
            <div className="grid grid-cols-3 gap-3 mb-4">
                {themes.map(theme => (
                    <button
                        key={theme.id}
                        onClick={() => setPrimaryColor(theme.color)}
                        className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-all"
                        title={theme.name}
                    >
                        <div
                            className="w-12 h-12 rounded-full border-4 transition-all"
                            style={{
                                backgroundColor: theme.color,
                                borderColor: primaryColor === theme.color ? '#333' : '#e5e7eb',
                                transform: primaryColor === theme.color ? 'scale(1.1)' : 'scale(1)',
                            }}
                        />
                        <span className="text-xs font-space text-[#8B6B7A]">
                            {theme.name}
                        </span>
                    </button>
                ))}
            </div>

            {/* Custom Color Picker */}
            <div className="border-t pt-4">
                <button
                    onClick={() => setShowCustomPicker(!showCustomPicker)}
                    className="w-full px-4 py-2 bg-gray-100 rounded-full font-space text-[#8B6B7A] hover:bg-gray-200 transition-all"
                >
                    🎨 Odaberi vlastitu boju
                </button>

                {showCustomPicker && (
                    <div className="mt-3 flex flex-col gap-2">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="color"
                                value={primaryColor}
                                onChange={(e) => setPrimaryColor(e.target.value)}
                                className="w-16 h-16 rounded-lg cursor-pointer border-2 border-gray-300"
                            />
                            <div className="flex-1">
                                <p className="text-xs font-space text-gray-600">
                                    Trenutna boja:
                                </p>
                                <p className="font-space font-semibold text-[#8B6B7A]">
                                    {primaryColor.toUpperCase()}
                                </p>
                            </div>
                        </label>
                    </div>
                )}
            </div>

            {/* Info tekst */}
            <p className="text-xs text-gray-500 font-space mt-4 text-center">
                Boja se automatski primjenjuje na cijelu aplikaciju
            </p>
        </div>
    );
};

export default ColorPicker;
