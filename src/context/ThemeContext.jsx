import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {

    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem("theme") === "dark";
    });

    useEffect(() => {
        const theme = darkMode ? "dark" : "light";

        document.documentElement.setAttribute("data-theme", theme);

        localStorage.setItem("theme", theme);
    }, [darkMode]);

    const toggleTheme = () => {
        setDarkMode(prev => !prev);
    };

    return (
        <ThemeContext.Provider
            value={{
                darkMode,
                toggleTheme
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}