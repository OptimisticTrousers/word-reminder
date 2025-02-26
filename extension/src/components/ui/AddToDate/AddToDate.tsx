import CSSModules from "react-css-modules";

import styles from "./AddToDate.module.css";

interface DefaultValues {
  minutes: number;
  hours: number;
  days: number;
  weeks: number;
  months: number;
}

interface Props {
  disabled: boolean;
  legend: string;
  defaultValues: DefaultValues;
}

export const AddToDate = CSSModules(
  function ({ disabled, legend, defaultValues}: Props) {
    const legendLower = legend.toLowerCase();
    return (
      <fieldset styleName="add-to-date" disabled={disabled}>
        <legend styleName="add-to-date__fieldset">{legend}</legend>
        <div styleName="add-to-date__control">
          <label
            styleName="add-to-date__label"
            htmlFor={`${legendLower}-minutes`}
          >
            Minutes
          </label>
          <input
            styleName="add-to-date__input"
            type="number"
            id={`${legendLower}-minutes`}
            name={`${legendLower}-minutes`}
            required
            max={60}
            min={0}
            defaultValue={defaultValues.minutes}
          />
        </div>
        <div styleName="add-to-date__control">
          <label
            styleName="add-to-date__label"
            htmlFor={`${legendLower}-hours`}
          >
            Hours
          </label>
          <input
            styleName="add-to-date__input"
            type="number"
            id={`${legendLower}-hours`}
            name={`${legendLower}-hours`}
            required
            max={24}
            min={0}
            defaultValue={defaultValues.hours}
          />
        </div>
        <div styleName="add-to-date__control">
          <label styleName="add-to-date__label" htmlFor={`${legendLower}-days`}>
            Days
          </label>
          <input
            styleName="add-to-date__input"
            type="number"
            id={`${legendLower}-days`}
            name={`${legendLower}-days`}
            required
            max={31}
            min={0}
            defaultValue={defaultValues.days}
          />
        </div>
        <div styleName="add-to-date__control">
          <label
            styleName="add-to-date__label"
            htmlFor={`${legendLower}-weeks`}
          >
            Weeks
          </label>
          <input
            styleName="add-to-date__input"
            type="number"
            id={`${legendLower}-weeks`}
            name={`${legendLower}-weeks`}
            required
            max={52}
            min={0}
            defaultValue={defaultValues.weeks}
          />
        </div>
        <div styleName="add-to-date__control">
          <label
            styleName="add-to-date__label"
            htmlFor={`${legendLower}-months`}
          >
            Months
          </label>
          <input
            styleName="add-to-date__input"
            type="number"
            id={`${legendLower}-months`}
            name={`${legendLower}-months`}
            required
            max={12}
            min={0}
            defaultValue={defaultValues.months}
          />
        </div>
      </fieldset>
    );
  },
  styles,
  { allowMultiple: true, handleNotFoundStyleName: "log" }
);
