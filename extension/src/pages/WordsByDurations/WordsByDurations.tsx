import CSSModules from "react-css-modules";
import styles from "./WordsByDurations.module.css";
import { Navigation } from "../../layouts";

const WordsByDurations = CSSModules(
  () => {
    return (
      <div>
        <Navigation />
        <div>hello</div>
      </div>
    );
  },
  styles,
  { allowMultiple: true, handleNotFoundStyleName: "ignore" }
);

export default WordsByDurations;
