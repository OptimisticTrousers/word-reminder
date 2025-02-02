import { UserWord as IUserWord, Word as IWord } from "common";
import { Info, Trash } from "lucide-react";
import { useState } from "react";
import CSSModules from "react-css-modules";

import { DeleteUserWordModal } from "../../modals/DeleteUserWordModal";
import { Word } from "../CondensedWord";
import styles from "./UserWord.module.css";

export const UserWord = CSSModules(
  function (props: IUserWord & IWord) {
    const [isAccordionOpen, setIsAccordionOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const toggleAccordion = () => {
      setIsAccordionOpen((prevValue) => !prevValue);
    };

    function toggleModal() {
      setIsModalOpen((prevIsModalOpen) => !prevIsModalOpen);
    }

    return (
      <>
        <div styleName="user-word">
          <article styleName="user-word__word word">
            <p styleName="word__name">{props.details[0].word}</p>
            <div styleName="word__divider"></div>
            <div styleName="word__buttons">
              <h3 styleName="word__heading">
                <button
                  id="accordion-button"
                  type="button"
                  styleName="word__button word__button--info"
                  onClick={toggleAccordion}
                  aria-expanded={isAccordionOpen}
                  aria-label="More word details"
                  aria-controls="accordion"
                >
                  <Info styleName="word__icon" />
                </button>
              </h3>
              <h3 styleName="word__heading">
                <button
                  styleName="word__delete word__button--delete"
                  onClick={toggleModal}
                  aria-haspopup={true}
                  aria-label="Open delete user word modal"
                >
                  <Trash styleName="word__icon" />
                </button>
              </h3>
            </div>
          </article>
          {isAccordionOpen && (
            <div
              id="accordion"
              styleName={`user-word__panel ${
                isAccordionOpen && "user-word__panel--active"
              }`}
              role="region"
              aria-labelledby="accordion-button"
            >
              <Word {...props} />
            </div>
          )}
        </div>
        {isModalOpen && (
          <DeleteUserWordModal
            toggleModal={toggleModal}
            wordId={props.word_id}
          />
        )}
      </>
    );
  },
  styles,
  { allowMultiple: true, handleNotFoundStyleName: "log" }
);
