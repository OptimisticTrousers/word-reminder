import { User } from "common";
import { useContext } from "react";
import CSSModules from "react-css-modules";
import { Outlet } from "react-router-dom";

import { ThemeContext } from "../../context/Theme";
import styles from "./App.module.css";
import { Footer } from "../../layouts/Footer";
import { Navigation } from "../../layouts/Navigation";
import { EmailConfirmation } from "../../pages/Auth/EmailConfirmation";

export const App = CSSModules(
  function ({ user }: { user: User }) {
    const { theme } = useContext(ThemeContext);

    if (!user.confirmed) {
      return <EmailConfirmation user={user} />;
    }

    return (
      <main styleName={`main main--${theme}`}>
        <Navigation />
        <Outlet context={{ user }} />
        <Footer />
      </main>
    );
  },
  styles,
  { allowMultiple: true, handleNotFoundStyleName: "log" }
);
