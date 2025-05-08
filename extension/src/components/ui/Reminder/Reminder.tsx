import cronstrue from "cronstrue";
import CSSModules from "react-css-modules";

import { ChangeEvent, useState } from "react";
import styles from "./Reminder.module.css";

interface Props {
  disabled: boolean;
  value: string;
}

export const Reminder = CSSModules(
  function ({ disabled, value }: Props) {
    const [reminder, setReminder] = useState(value);

    function handleReminderChange(event: ChangeEvent<HTMLInputElement>) {
      setReminder(event.target.value);
    }

    return (
      <div styleName="reminder">
        <a href="https://cronprompt.com/">Visit cronprompt for more details</a>
        <p styleName="reminder__description">
          {reminder &&
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
            onChange={handleReminderChange}
            value={reminder}
            placeholder="Enter a valid cron expression (ie. * * * * * or */5 * * * *)"
          />
        </label>
      </div>
    );
  },
  styles,
  { allowMultiple: true, handleNotFoundStyleName: "log" }
);
