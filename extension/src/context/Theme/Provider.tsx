import { Dispatch, ReactNode, SetStateAction } from "react";

import { Theme, ThemeContext } from "./Context";
import { useLocalStorage } from "../../hooks/useLocalStorage";

interface Props {
  children: ReactNode;
}

export interface ThemeContext {
  theme: Theme;
  setTheme: Dispatch<SetStateAction<Theme>>;
}

export function ThemeProvider({ children }: Props) {
  const [theme, setTheme] = useLocalStorage("theme", Theme.Dark);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
