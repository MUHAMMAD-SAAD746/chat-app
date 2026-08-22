import { useTheme } from "../../../context/ThemeContext";
import "./ThemeSettings.css";

function ThemeSettings() {
    const { darkMode, toggleTheme } = useTheme();

    return (
        <div className="theme-settings">
            <div className="theme-settings-info">
                <h3>Theme</h3>
                <p>{darkMode ? "Dark mode" : "Light mode"}</p>
            </div>

            <button
                className={`theme-toggle ${darkMode ? "active" : ""}`}
                onClick={toggleTheme}
                aria-label="Toggle theme"
            />
        </div>
    );
}

export default ThemeSettings;