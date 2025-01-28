import CSSModules from "react-css-modules";

import styles from "./Settings.module.css";

export const Settings = CSSModules(
  function () {
    return <div></div>;
  },
  styles,
  {
    allowMultiple: false,
    handleNotFoundStyleName: "log",
  }
);
