/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC } from "react";
import CSSModules from "react-css-modules";
import ModalContainer from "../ModalContainer";
import styles from "./DeleteWordsByDuration.module.css";
import { useMutation } from "@tanstack/react-query";
import useHttp from "../../hooks/useHttp";

interface Props {
  toggleModal: () => void;
  wordsByDurationId: string;
}

const DeleteWordsByDurationModal: FC<Props> = CSSModules(
  ({ toggleModal, wordsByDurationId }) => {
    const { remove } = useHttp();

    const { data, isLoading, error, mutate }: any = useMutation({
      mutationFn: (wordsByDurationId) => {
        return remove(
          `${
            import.meta.env.VITE_API_DOMAIN
          }/users/665164760636f4834e053388/wordsByDurations/${wordsByDurationId}`
        );
      },
    });

    const handleDelete = (event: any) => {
      event.preventDefault();
      mutate(wordsByDurationId);
      toggleModal();
    };

    return (
      <ModalContainer title="Delete Post" toggleModal={toggleModal}>
        <form styleName="modal" onSubmit={handleDelete}>
          <p styleName="modal__alert">
            Are you sure you want to delete your words by duration, bob jones?
          </p>
          <p styleName="modal__message">You can't undo this action.</p>
          <div styleName="modal__buttons">
            <button
              styleName="modal__button modal__button--cancel"
              onClick={toggleModal}
            >
              Cancel
            </button>
            <button
              styleName="modal__button modal__button--delete"
              type="submit"
            >
              {isLoading ? "Deleting..." : "Delete"}
            </button>
          </div>
        </form>
      </ModalContainer>
    );
  },
  styles,
  { allowMultiple: true, handleNotFoundStyleName: "ignore" }
);

export default DeleteWordsByDurationModal;
