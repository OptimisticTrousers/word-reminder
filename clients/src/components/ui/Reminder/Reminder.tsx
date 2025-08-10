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
        <div styleName="reminder__top">
          <p styleName="reminder__note">
            <span styleName="reminder__bold">Important: </span>
            <a
              styleName="reminder__link"
              href="https://github.com/OptimisticTrousers/word-reminder?tab=readme-ov-file#word-reminder-attributes"
            >
              See details on the reminder attribute here.
            </a>
          </p>
          <a styleName="reminder__link" href="https://cronprompt.com/">
            Visit cronprompt to enter a valid reminder.
          </a>
        </div>
        <div styleName="reminder__control">
          <label styleName="reminder__label" htmlFor="reminder">
            Reminder
          </label>
          <input
            styleName="reminder__input"
            type="text"
            id="reminder"
            name="reminder"
            required={true}
            disabled={disabled}
            onChange={handleReminderChange}
            value={reminder}
            placeholder="Enter a valid UTC cron expression (ie. * * * * * or */5 * * * *)"
          />
        </div>
        {reminder && (
          <p styleName="reminder__description">
            <span styleName="reminder__text">{reminder}</span>
            is equivalent to
            <span styleName="reminder__text">
              {cronstrue.toString(reminder, {
                throwExceptionOnParseError: false,
              })}
            </span>
          </p>
        )}
      </div>
    );
  },
  styles,
  { allowMultiple: true, handleNotFoundStyleName: "ignore" }
);
