import { ReactNode } from "react";

import { Theme, ThemeContext } from "./Context";
import { useLocalStorage } from "../../hooks/useLocalStorage";

interface Props {
  children: ReactNode;
}

export interface ThemeContext {
  theme: Theme;
  toggleTheme: () => void;
}

export function ThemeProvider({ children }: Props) {
  const [theme, setTheme] = useLocalStorage("theme", Theme.Dark);

  function toggleTheme() {
    setTheme((prevTheme: string) => {
      if (prevTheme === "light") {
        return "dark";
      } else if (prevTheme === "dark") {
        return "light";
      }
    });
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
