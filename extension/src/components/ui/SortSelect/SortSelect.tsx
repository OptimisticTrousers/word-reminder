import CSSModules from "react-css-modules";

import styles from "./SortSelect.module.css";

interface Props {
  disabled: boolean;
  required: boolean;
}

export const SortSelect = CSSModules(
  function ({ disabled, required }: Props) {
    return (
      <div styleName="sort">
        <label styleName="sort__label">
          Sort by:
          <select
            styleName="sort__select"
            name="created_at"
            disabled={disabled}
            required={required}
          >
            <option styleName="sort__option" value="">
              Featured
            </option>
            <option styleName="sort__option" value="1">
              Newest
            </option>
            <option styleName="sort__option" value="-1">
              Oldest
            </option>
          </select>
        </label>
      </div>
    );
  },
  styles,
  { allowMultiple: true, handleNotFoundStyleName: "log" }
);
