import CSSModules from "react-css-modules";
import styles from "./NoMore.module.css";
import { FC } from "react";

interface Props {
  title: string;
  description: string;
}

const NoMore: FC<Props> = CSSModules(
  ({ title, description }) => {
    return (
      <div styleName="container">
        <p styleName="container__title">{title}</p>
        <p styleName="container__description">{description}</p>
      </div>
    );
  },
  styles,
  { allowMultiple: true, handleNotFoundStyleName: "ignore" }
);

export default NoMore;
