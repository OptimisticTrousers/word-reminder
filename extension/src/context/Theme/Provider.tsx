import { Dispatch, ReactNode, SetStateAction } from "react";

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
  const [theme, setTheme] = useLocalStorage("theme", Theme.Dark) as [
    Theme,
    Dispatch<SetStateAction<Theme>>
  ];

  function toggleTheme() {
    setTheme((prevTheme) => {
      switch (prevTheme) {
        case Theme.Light:
          return Theme.Dark;
        case Theme.Dark:
          return Theme.Light;
        default:
          return Theme.Dark;
      }
    });
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
