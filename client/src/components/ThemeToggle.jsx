import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { themes } from '../context/themes';
import { Sun, Moon, Palette, ChevronDown } from 'lucide-react';

const themeIcons = {
  light: <Sun className="w-5 h-5" />,
  dark: <Moon className="w-5 h-5" />,
  blue: <Palette className="w-5 h-5" />,
};

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const cfg = themes[theme];

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300"
        style={{
          backgroundColor: cfg.card,
          border: `1px solid ${cfg.border}`,
          color: cfg.text,
        }}
        aria-label="Change theme"
      >
        {themeIcons[theme]}
        <span className="text-xs font-medium capitalize" style={{ color: cfg.text }}>{themes[theme].name}</span>
        <ChevronDown className="w-4 h-4 ml-1" style={{ color: cfg.text, opacity: 0.5 }} />
      </button>

      {/* Theme dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-2xl shadow-2xl z-50 animate-in fade-in zoom-in duration-200" style={{         backgroundColor: cfg.card, border: `1px solid ${cfg.border}` }}>
          <div className="px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: cfg.text, opacity: 0.6 }}>Select Theme</p>
            <div className="space-y-2">
              {Object.entries(themes).map(([key, themeObj]) => {
                const isActive = theme === key;
                return (
                  <button
                    key={key}
                    onClick={() => handleThemeChange(key)}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors w-full text-left"
                    style={{
                      backgroundColor: isActive ? themeObj.accent : 'transparent',
                      color: isActive ? themeObj.inverse : cfg.text,
                      border: isActive ? `1px solid ${themeObj.accent}` : '1px solid transparent',
                    }}
                  >
                    {React.cloneElement(themeIcons[key], {
                      style: { color: isActive ? themeObj.inverse : cfg.accent },
                    })}
                    <span className="font-medium capitalize" style={{ color: isActive ? themeObj.inverse : cfg.text }}>{themeObj.name}</span>
                    {isActive && (
                      <span className="ml-auto w-2 h-2 rounded-full" style={{ backgroundColor: themeObj.inverse }} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}