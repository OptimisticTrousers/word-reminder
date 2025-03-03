import { CirclePlus } from "lucide-react";
import { useContext, useState } from "react";
import CSSModules from "react-css-modules";

import { ThemeContext } from "../../../context/Theme";
import styles from "./AutoCreateWordReminder.module.css";
import { User } from "common";
import { useOutletContext } from "react-router-dom";
import { AutoCreateWordReminderModal } from "../../modals/CreateAutoWordReminderModal";

interface Props {
  searchParams: URLSearchParams;
}

export const AutoCreateWordReminder = CSSModules(
  function ({ searchParams }: Props) {
    const [isModalVisible, setIsModalVisible] = useState(false);

    const { user }: { user: User } = useOutletContext();
    const { theme } = useContext(ThemeContext);

    const toggleModal = () => {
      setIsModalVisible((prevValue) => !prevValue);
    };

    return (
      <>
        {isModalVisible && (
          <AutoCreateWordReminderModal
            searchParams={searchParams}
            toggleModal={toggleModal}
          />
        )}
        <button
          styleName={`create create--${theme}`}
          onClick={toggleModal}
          aria-haspopup="dialog"
          aria-labelledby="title"
        >
          <div styleName="create__container">
            <CirclePlus styleName="create__icon" />
            <div styleName="create__text">
              <h2 styleName="create__title" id="title">
                {user.auto
                  ? "Automatic Create Word Reminder Toggled..."
                  : "Automatic Create Word Reminder"}
              </h2>
              <p styleName="create__description">
                Automatically create word reminder on an interval to remember
                words you come across in your readings. Set it and forget it.
              </p>
            </div>
          </div>
        </button>
      </>
    );
  },
  styles,
  { allowMultiple: true, handleNotFoundStyleName: "log" }
);
