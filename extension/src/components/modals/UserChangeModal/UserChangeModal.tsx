import { CODE_MAX_BYTES, User } from "common";
import CSSModules from "react-css-modules";
import { useNavigate, useOutletContext } from "react-router-dom";

import { ModalContainer } from "../ModalContainer";
import styles from "./UserChangeModal.module.css";

interface Props {
  toggleModal: () => void;
  path: string;
}

export const UserChangeModal = CSSModules(
  function ({ toggleModal, path }: Props) {
    const { user }: { user: User } = useOutletContext();
    const navigate = useNavigate();

    function handleConfirm(formData: FormData) {
      const code = formData.get("code") as string;
      navigate(`/users/update/${path}/${code}`);
      toggleModal();
    }

    function handleCancel() {
      toggleModal();
    }

    return (
      <ModalContainer title="Confirm your email" toggleModal={toggleModal}>
        <form styleName="modal" action={handleConfirm}>
          <p styleName="modal__message">
            Please enter the confirmation code that was sent to{" "}
            <span styleName="modal__bold">{user.email}</span> within 5 minutes.
          </p>
          <label styleName="modal__label">
            Code
            <input
              styleName="modal__input"
              name="code"
              type="text"
              required={true}
              maxLength={CODE_MAX_BYTES}
            />
          </label>
          <div styleName="modal__buttons">
            <button
              styleName="modal__button modal__button--cancel"
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button
              styleName="modal__button modal__button--confirm"
              type="submit"
            >
              Enter Code
            </button>
          </div>
        </form>
      </ModalContainer>
    );
  },
  styles,
  { allowMultiple: true, handleNotFoundStyleName: "log" }
);
