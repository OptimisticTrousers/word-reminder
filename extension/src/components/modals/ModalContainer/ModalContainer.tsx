import { SquareX } from "lucide-react";
import { ReactNode } from "react";
import CSSModules from "react-css-modules";

import { useDisableScroll } from "../../../hooks/useDisableScroll";
import styles from "./ModalContainer.module.css";

interface Props {
  children: ReactNode;
  title: string;
  toggleModal: () => void;
}

export const ModalContainer = CSSModules(
  function ({ children, title, toggleModal }: Props) {
    useDisableScroll();

    function handleClose() {
      toggleModal();
    }

    return (
      <div
        styleName="modal"
        aria-modal="true"
        role="dialog"
        aria-labelledby="modal-title"
      >
        <div styleName="modal__container" className="scale-down">
          <header styleName="modal__header">
            <button
              styleName="modal__button"
              onClick={handleClose}
              aria-label="Close modal"
            >
              <SquareX styleName="modal__icon" />
            </button>
            <div styleName="modal__title-bar" id="modal-title">
              <h2 styleName="modal__title">{title}</h2>
            </div>
          </header>
          {children}
        </div>
      </div>
    );
  },
  styles,
  { allowMultiple: false, handleNotFoundStyleName: "log" }
);
