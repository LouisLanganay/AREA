import React, { createContext, useContext, useEffect, useState } from "react";

/**
 * Type definition for supported themes
 */
type Theme = "light" | "dark";

/**
 * Interface defining the theme context shape
 */
type ThemeContextType = {
  theme: Theme;                     // Current theme
  toggleTheme: () => void;         // Function to switch between themes
  setTheme: (theme: Theme) => void; // Function to set specific theme
};

// Create context with undefined default value
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * Provider component for theme management
 * Handles theme switching and persistence
 */
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Initialize theme from localStorage or default to dark
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem("theme") as Theme) || "dark";
  });

  // Update document classes and save theme when it changes
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  /**
   * Toggles between light and dark themes
   */
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Hook to use the theme context
 * @throws {Error} If used outside of ThemeProvider
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};
