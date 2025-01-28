import { CirclePlus } from "lucide-react";
import { useContext, useState } from "react";
import CSSModules from "react-css-modules";

import { ThemeContext } from "../../../context/Theme";
import CreateWordsByDurationModal from "../../modals/CreateWordReminderModal/CreateWordReminderModal";
import styles from "./CreateWordsByDuration.module.css";

export const CreateWordReminder = CSSModules(
  function () {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const { theme } = useContext(ThemeContext);

    const toggleModal = () => {
      setIsCreateModalOpen((prevValue) => !prevValue);
    };

    return (
      <>
        {isCreateModalOpen && (
          <CreateWordsByDurationModal toggleModal={toggleModal} />
        )}
        <button
          styleName={`create create--${theme}`}
          onClick={toggleModal}
          aria-haspopup="dialog"
        >
          <div styleName="create__container">
            <CirclePlus styleName="create__icon" />
            <div styleName="create__text">
              <h3 styleName="create__title">Create a Words By Duration</h3>
              <p styleName="create__description">
                What&apos;s on your mind, bob jones? Create a words by duration
                or randomly generate one!
              </p>
            </div>
          </div>
        </button>
      </>
    );
  },
  styles,
  { allowMultiple: false, handleNotFoundStyleName: "log" }
);
