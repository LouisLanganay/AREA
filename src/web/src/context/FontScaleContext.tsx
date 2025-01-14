import React, { createContext, useContext, useEffect, useState } from "react";

/**
 * Interface defining the font scale context shape
 */
type FontScaleContextType = {
  fontScale: number;                      // Current font scale value
  setFontScale: (value: number) => void;  // Function to update font scale
};

// Create context with undefined default value
const FontScaleContext = createContext<FontScaleContextType | undefined>(undefined);

/**
 * Provider component for font scaling functionality
 * Manages font size scaling across the application
 */
export const FontScaleProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Initialize font scale from localStorage or default to 1
  const [fontScale, setFontScale] = useState(() => {
    const savedFontScale = localStorage.getItem("fontScale");
    return savedFontScale ? parseFloat(savedFontScale) : 1;
  });

  // Update document font size and save to localStorage when scale changes
  useEffect(() => {
    document.documentElement.style.fontSize = `${fontScale * 100}%`;
    localStorage.setItem("fontScale", fontScale.toString());
  }, [fontScale]);

  return (
    <FontScaleContext.Provider value={{ fontScale, setFontScale }}>
      {children}
    </FontScaleContext.Provider>
  );
};

/**
 * Hook to use the font scale context
 * @throws {Error} If used outside of FontScaleProvider
 */
export const useFontScale = () => {
  const context = useContext(FontScaleContext);
  if (!context) {
    throw new Error("useFontScale must be used within FontScaleProvider");
  }
  return context;
};
