import { User } from "common";
import CSSModules from "react-css-modules";
import { Outlet } from "react-router-dom";

import styles from "./App.module.css";
import { Footer } from "../../layouts/Footer";
import { Navigation } from "../../layouts/Navigation";
import { EmailConfirmation } from "../../pages/Auth/EmailConfirmation";
import { useMobileTextSelectionAction } from "../../hooks/useMobileTextSelectionAction";

export const App = CSSModules(
  function ({ user }: { user: User }) {
    useMobileTextSelectionAction(String(user.id));

    if (import.meta.env.MODE === "production") {
      if (!user.confirmed) {
        return <EmailConfirmation user={user} />;
      }
    }

    return (
      <div styleName="app">
        <Navigation />
        <main styleName="app__main">
          <Outlet context={{ user }} />
        </main>
        <Footer />
      </div>
    );
  },
  styles,
  { allowMultiple: true, handleNotFoundStyleName: "log" }
);
