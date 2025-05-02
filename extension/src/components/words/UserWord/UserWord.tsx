import { Detail } from "common";
import { Info, Trash } from "lucide-react";
import { useState } from "react";
import CSSModules from "react-css-modules";
import { Link } from "react-router-dom";

import { DeleteUserWordModal } from "../../modals/DeleteUserWordModal";
import { CondensedWord } from "../CondensedWord";
import styles from "./UserWord.module.css";

export const UserWord = CSSModules(
  function ({
    learned,
    created_at,
    updated_at,
    details,
    id,
  }: {
    learned: boolean;
    created_at: Date;
    updated_at: Date;
    details: Detail[];
    id: number;
  }) {
    const [isAccordionOpen, setIsAccordionOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const toggleAccordion = () => {
      setIsAccordionOpen((prevValue) => !prevValue);
    };

    function toggleDeleteModal() {
      setIsDeleteModalOpen((prevIsDeleteModalOpen) => !prevIsDeleteModalOpen);
    }

    return (
      <>
        <div styleName="user-word">
          <article styleName="user-word__word word">
            <p styleName="word__name">Word: {details[0].word}</p>
            <p styleName="word__name">
              Created At: {created_at.toLocaleString()}
            </p>
            <p styleName="word__name">
              Updated At: {updated_at.toLocaleString()}
            </p>
            <p styleName="word__name">Learned: {learned}</p>
            <div styleName="word__divider"></div>
            <div styleName="word__buttons">
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
              <button
                styleName="word__delete word__button--delete"
                onClick={toggleDeleteModal}
                aria-haspopup={true}
                aria-label="Open delete user word modal"
              >
                <Trash styleName="word__icon" />
              </button>
              <Link to={`/userWords/${id}`}>More Word Details</Link>
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
              <CondensedWord details={details} />
            </div>
          )}
        </div>
        {isDeleteModalOpen && (
          <DeleteUserWordModal
            toggleModal={toggleDeleteModal}
            userWordId={String(id)}
          />
        )}
      </>
    );
  },
  styles,
  { allowMultiple: true, handleNotFoundStyleName: "log" }
);
