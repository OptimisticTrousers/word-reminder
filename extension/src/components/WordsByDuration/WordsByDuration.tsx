import CSSModules from "react-css-modules";
import styles from "./WordsByDuration.module.css";

const WordsByDuration = CSSModules(() => {
    return (
        <div>
            <h1>Hello there</h1>
        </div>
    )
}, styles, { allowMultiple: true, handleNotFoundStyleName: "ignore" })

export default WordsByDuration;