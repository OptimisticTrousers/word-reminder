import { createContext } from "react";

import { ThemeContext as Context } from "./Provider";

export enum Theme {
  Dark = "dark",
  Light = "light",
}

export const ThemeContext = createContext<Context>({
  theme: Theme.Dark,
  setTheme: function () {},
});
