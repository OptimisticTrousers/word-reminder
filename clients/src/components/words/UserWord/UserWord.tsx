import { Detail, User } from "common";
import { GraduationCap, Info, Trash } from "lucide-react";
import { FormEvent, useState } from "react";
import CSSModules from "react-css-modules";
import { Link, useOutletContext } from "react-router-dom";

import { DeleteUserWordModal } from "../../modals/DeleteUserWordModal";
import { CondensedWord } from "../CondensedWord";
import styles from "./UserWord.module.css";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userWordService } from "../../../services/user_word_service";
import { useNotificationError } from "../../../hooks/useNotificationError";

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

    const queryClient = useQueryClient();
    const { user }: { user: User } = useOutletContext();
    const userId = String(user.id);
    const { showNotificationError } = useNotificationError();

    const { isPending, mutate } = useMutation({
      mutationFn: userWordService.updateUserWord,
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["userWords"],
        });
      },
      onError: showNotificationError,
    });

    const toggleAccordion = () => {
      setIsAccordionOpen((prevValue) => !prevValue);
    };

    function toggleDeleteModal() {
      setIsDeleteModalOpen((prevIsDeleteModalOpen) => !prevIsDeleteModalOpen);
    }

    function handleLearned(event: FormEvent<HTMLFormElement>) {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      mutate({
        userId,
        userWordId: String(id),
        body: {
          learned: (formData.get("learned") as string) === "true",
        },
      });
    }

    const disabled = isPending;

    return (
      <>
        <div styleName="user-word">
          <article styleName="user-word__word word">
            <div styleName="user-word__header">
              <h3 styleName="word__name">{details[0].word}</h3>
              <Link to={`/userWords/${id}`}>More Word Details</Link>
            </div>
            <p styleName="word__name">
              Created At: {created_at.toLocaleString()}
            </p>
            <p styleName="word__name">
              Updated At: {updated_at.toLocaleString()}
            </p>
            <p styleName="word__name">Learned: {learned ? "Yes" : "No"}</p>
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
              <form styleName="word__form" onSubmit={handleLearned}>
                <input
                  styleName="word__input"
                  type="hidden"
                  id="learned"
                  name="learned"
                  required
                  defaultValue={String(!learned)}
                />
                <button
                  styleName="word__button"
                  type="submit"
                  disabled={disabled}
                >
                  <GraduationCap styleName="word__icon" />
                  {disabled ? "Toggling Learned..." : "Toggle Learned"}
                </button>
              </form>
              <button
                styleName="word__delete"
                onClick={toggleDeleteModal}
                aria-haspopup={true}
                aria-label="Open delete user word modal"
              >
                <Trash styleName="word__icon" />
              </button>
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
