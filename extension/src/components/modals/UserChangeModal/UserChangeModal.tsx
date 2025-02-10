import { TOKEN_MAX_BYTES, User } from "common";
import CSSModules from "react-css-modules";
import { useNavigate, useOutletContext } from "react-router-dom";

import { ModalContainer } from "../ModalContainer";
import styles from "./UserChangeModal.module.css";
import { ToggleModal } from "../types";

interface Props {
  toggleModal: ToggleModal;
}

export const UserChangeModal = CSSModules(
  function ({ toggleModal }: Props) {
    const { user }: { user: User } = useOutletContext();
    const navigate = useNavigate();

    function handleConfirm(formData: FormData) {
      const token = formData.get("token") as string;
      navigate(`/settings/${token}`);
      toggleModal();
    }

    return (
      <ModalContainer title="Confirm your email" toggleModal={toggleModal}>
        <form styleName="modal" action={handleConfirm}>
          <p styleName="modal__message">
            Please enter the confirmation code that was sent to{" "}
            <span styleName="modal__bold">{user.email}</span> within 5 minutes.
          </p>
          <label styleName="modal__label" htmlFor="token">
            Code
          </label>
          <input
            styleName="modal__input"
            id="token"
            name="token"
            type="text"
            required
            maxLength={TOKEN_MAX_BYTES}
          />
          <div styleName="modal__buttons">
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
