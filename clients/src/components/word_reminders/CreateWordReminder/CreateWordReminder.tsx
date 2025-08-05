import { CirclePlus } from "lucide-react";
import { useContext, useState } from "react";
import CSSModules from "react-css-modules";

import { ThemeContext } from "../../../context/Theme";
import { CreateWordReminderModal } from "../../modals/CreateWordReminderModal";
import styles from "./CreateWordReminder.module.css";

export const CreateWordReminder = CSSModules(
  function () {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { theme } = useContext(ThemeContext);

    const toggleModal = () => {
      setIsModalOpen((prevValue) => !prevValue);
    };

    return (
      <>
        {isModalOpen && <CreateWordReminderModal toggleModal={toggleModal} />}
        <button
          styleName={`create create--${theme}`}
          onClick={toggleModal}
          aria-haspopup="dialog"
          aria-labelledby="wordreminder-title"
        >
          <div styleName="create__container">
            <CirclePlus styleName="create__icon" />
            <div styleName="create__text">
              <h2 styleName="create__title" id="wordreminder-title">
                Create Word Reminder
              </h2>
              <p styleName="create__description">
                Create a word reminder to remember words you come across in your
                readings.
              </p>
            </div>
          </div>
        </button>
      </>
    );
  },
  styles,
  { allowMultiple: true, handleNotFoundStyleName: "ignore" }
);
