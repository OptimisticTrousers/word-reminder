import CSSModules from "react-css-modules";
import styles from "./WordsByDurations.module.css";

const WordsByDurations = CSSModules(
  () => {
    return (
      <div></div>
    )
  },
  styles,
  { allowMultiple: true, handleNotFoundStyleName: "ignore" }
);

export default WordsByDurations;
