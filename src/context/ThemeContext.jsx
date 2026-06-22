import { createContext, useState, useEffect, useContext } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    // İlk açılışta kullanıcının eski tercihini veya işletim sisteminin temasını kontrol et
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            return savedTheme === 'dark';
        }
        // Eğer daha önce seçim yapmadıysa sistem tercihine bak (Örn: Mac/Windows dark moddaysa)
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    // isDarkMode değiştiğinde HTML köküne class ekle/çıkar ve hafızaya kaydet
    useEffect(() => {
        const root = document.documentElement;
        if (isDarkMode) {
            root.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            root.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    const toggleTheme = () => setIsDarkMode((prev) => !prev);

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

// İstediğimiz yerden kolayca çağırmak için custom hook
// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => useContext(ThemeContext);