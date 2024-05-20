import CSSModules from "react-css-modules";
import styles from "./Words.module.css";

const Words = CSSModules(
  () => {
    return (
      <div>
        <table styleName="table">
          <caption styleName="table__caption">User stored words</caption>
          <thead styleName="table__head">
            <tr styleName="table__row">
              <th styleName="table__header" scope="col">
                Word
              </th>
              <th styleName="table__header" scope="col">
                Meaning
              </th>
              <th styleName="table__header" scope="col">
                Edit
              </th>
              <th styleName="table__header" scope="col">
                Delete
              </th>
            </tr>
          </thead>
          <tbody styleName="table__body">
            <tr styleName="table__row">
              <th scope="row">Superfluous</th>
              <td styleName="table__cell">unnecessary</td>
              <td styleName="table__cell">
                <button>Edit</button>
              </td>
              <td styleName="table__cell">
                <button>Delete</button>
              </td>
            </tr>
          </tbody>
        </table>

        <label>Please enter a word</label>
        <input placeholder="Please enter a word that you would like to add to this" />
        <button type="submit">Submit</button>
      </div>
    );
  },
  styles,
  {
    allowMultiple: true,
    handleNotFoundStyleName: "log",
  }
);

export default Words;
