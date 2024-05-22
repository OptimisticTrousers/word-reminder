import CSSModules from "react-css-modules";
import styles from "./Navigation.module.css";
import { Link, useLocation } from "react-router-dom";

const Navigation = CSSModules(() => {
    const location = useLocation();

    let isWordsActive = false;
    let isWordsByDurationsActive = false;

    const subdirectory = location.pathname.slice(location.pathname.lastIndexOf("/"), location.pathname.length)
    if (subdirectory === "") {
        isWordsActive = true;
    } else if (subdirectory === "/wordsByDurations") {
        isWordsByDurationsActive = true;
    }
    return (
        <div styleName="navigation">
            <Link to="/" styleName={`navigation__link--tab ${isWordsActive && "words__button--tab--active"}`}>Words</Link>
            <Link to="/wordsByDuration" styleName={`navigation__link navigation__link--tab ${isWordsByDurationsActive && "navigation__link--tab--active"}`}>Words By Duration</Link>
        </div>
    )
}, styles, { allowMultiple: true, handleNotFoundStyleName: "ignore" })

export default Navigation;