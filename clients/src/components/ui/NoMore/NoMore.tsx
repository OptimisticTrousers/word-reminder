import CSSModules from "react-css-modules";

import styles from "./NoMore.module.css";

interface Props {
  name: string;
}

export const NoMore = CSSModules(
  function ({ name }: Props) {
    const lowerCaseName = name.toLowerCase();
    return (
      <div styleName="container">
        <p styleName="container__title">{`No more ${lowerCaseName}`}</p>
        <p styleName="container__description">{`Add more ${lowerCaseName} to see more ${lowerCaseName} in your collection.`}</p>
      </div>
    );
  },
  styles,
  { allowMultiple: true, handleNotFoundStyleName: "log" }
);
