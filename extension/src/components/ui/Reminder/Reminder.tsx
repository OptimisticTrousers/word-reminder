import cronstrue from "cronstrue";
import CSSModules from "react-css-modules";

import { ChangeEvent } from "react";
import styles from "./Reminder.module.css";

interface Props {
  disabled: boolean;
  value: string;
  handleChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

export const Reminder = CSSModules(
  function ({ disabled, value, handleChange }: Props) {
    return (
      <div styleName="reminder">
        <p styleName="reminder__description">
          {value &&
            cronstrue.toString(value, {
              throwExceptionOnParseError: false,
            })}
        </p>
        <label styleName="reminder__label">
          Reminder
          <input
            styleName="reminder__input"
            type="text"
            name="reminder"
            required={true}
            disabled={disabled}
            onChange={handleChange}
            value={value}
          />
        </label>
      </div>
    );
  },
  styles,
  { allowMultiple: true, handleNotFoundStyleName: "log" }
);
