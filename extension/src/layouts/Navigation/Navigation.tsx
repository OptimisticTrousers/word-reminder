import CSSModules from "react-css-modules";
import styles from "./Navigation.module.css";
import { NavLink, useLocation } from "react-router-dom";

const Navigation = CSSModules(
  () => {
    const location = useLocation();

    let isWordsActive = false;
    let isWordsByDurationsActive = false;

    const subdirectory = location.pathname.slice(
      location.pathname.lastIndexOf("/"),
      location.pathname.length
    );
    if (subdirectory === "") {
      isWordsActive = true;
    } else if (subdirectory === "/wordsByDurations") {
      isWordsByDurationsActive = true;
    }
    return (
      <div styleName="navigation">
        <NavLink
          style={({ isActive }) => {
            return {
              color: isActive ? "red" : "inherit",
            };
          }}
          to="/"
          styleName={`navigation__link--tab ${
            isWordsActive && "words__button--tab--active"
          }`}
        >
          Words
        </NavLink>
        <NavLink
          to="/wordsByDurations"
          styleName={`navigation__link navigation__link--tab ${
            isWordsByDurationsActive && "navigation__link--tab--active"
          }`}
        >
          Words By Duration
        </NavLink>
      </div>
    );
  },
  styles,
  { allowMultiple: true, handleNotFoundStyleName: "ignore" }
);

export default Navigation;
