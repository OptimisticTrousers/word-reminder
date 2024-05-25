import CSSModules from "react-css-modules";
import styles from "./Loading.module.css";

const Loading = CSSModules(
  () => {
    return (
      <div styleName="loading">
        <img
          styleName="loading__image"
          src={"/images/loading.gif"}
          alt="loader"
        />
      </div>
    );
  },
  styles,
  {
    allowMultiple: true,
    handleNotFoundStyleName: "ignore",
  }
);

export default Loading;
