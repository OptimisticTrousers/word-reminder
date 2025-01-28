import CSSModules from "react-css-modules";

import loadingImage from "../../../assets/images/loading.gif";
import styles from "./Loading.module.css";

export const Loading = CSSModules(
  function () {
    return (
      <div styleName="loading">
        <img styleName="loading__image" src={loadingImage} alt="loading" />
      </div>
    );
  },
  styles,
  { allowMultiple: true, handleNotFoundStyleName: "log" }
);
