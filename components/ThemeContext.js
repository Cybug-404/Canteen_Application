import React, { createContext, useContext, useState } from "react";

export const lightColors = {
  gd: "#087A2D",
  gm: "#16A34A",
  gl: "#EAF7EE",
  am: "#F59E0B",
  al: "#FFF7E6",
  cream: "#F7F8F6",
  cb: "#FFFFFF",
  tp: "#111827",
  ts: "#6B7280",
  bd: "#E5E7EB",
  rd: "#EF4444",
  rdl: "#FEE2E2",
  shadow: "rgba(17,24,39,0.14)",
};

export const darkColors = {
  gd: "#07110D",
  gm: "#4ADE80",
  gl: "#123D26",
  am: "#FBBF24",
  al: "#2A2111",
  cream: "#070B0F",
  cb: "#10161D",
  tp: "#F9FAFB",
  ts: "#A7B0BC",
  bd: "#26313D",
  rd: "#F87171",
  rdl: "#3F1518",
  shadow: "rgba(0,0,0,0.45)",
};

export const ThemeContext = createContext({
  isDarkMode: false,
  colors: lightColors,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const colors = isDarkMode ? darkColors : lightColors;
  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  return (
    <ThemeContext.Provider value={{ isDarkMode, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
