import CSSModules from "react-css-modules";

import styles from "./Duration.module.css";

interface Props {
  disabled: boolean;
  defaultValues: {
    minutes: number;
    hours: number;
    days: number;
    weeks: number;
  };
}

export const Duration = CSSModules(
  function ({ disabled, defaultValues }: Props) {
    return (
      <fieldset styleName="duration" disabled={disabled}>
        <legend styleName="duration__legend">Duration</legend>
        <div styleName="duration__control">
          <label styleName="duration__label" htmlFor="minutes">
            Minutes
          </label>
          <input
            styleName="duration__input"
            type="number"
            id="minutes"
            name="minutes"
            required
            max={59}
            min={0}
            defaultValue={defaultValues.minutes}
          />
        </div>
        <div styleName="duration__control">
          <label styleName="duration__label" htmlFor="hours">
            Hours
          </label>
          <input
            styleName="duration__input"
            type="number"
            id="hours"
            name="hours"
            required
            max={23}
            min={0}
            defaultValue={defaultValues.hours}
          />
        </div>
        <div styleName="duration__control">
          <label styleName="duration__label" htmlFor="days">
            Days
          </label>
          <input
            styleName="duration__input"
            type="number"
            id="days"
            name="days"
            required
            max={30}
            min={0}
            defaultValue={defaultValues.days}
          />
        </div>
        <div styleName="duration__control">
          <label styleName="duration__label" htmlFor="weeks">
            Weeks
          </label>
          <input
            styleName="duration__input"
            type="number"
            id="weeks"
            name="weeks"
            required
            max={51}
            min={0}
            defaultValue={defaultValues.weeks}
          />
        </div>
      </fieldset>
    );
  },
  styles,
  { allowMultiple: true, handleNotFoundStyleName: "ignore" }
);
