import React, { createContext, useContext, useEffect, useState } from "react";

type FontScaleContextType = {
  fontScale: number;
  setFontScale: (value: number) => void;
};

const FontScaleContext = createContext<FontScaleContextType | undefined>(
  undefined
);

export const FontScaleProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [fontScale, setFontScale] = useState(() => {
    const savedFontScale = localStorage.getItem("fontScale");
    return savedFontScale ? parseFloat(savedFontScale) : 1;
  });

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

export const useFontScale = () => {
  const context = useContext(FontScaleContext);
  if (!context) {
    throw new Error("useFontScale must be used within FontScaleProvider");
  }
  return context;
};
