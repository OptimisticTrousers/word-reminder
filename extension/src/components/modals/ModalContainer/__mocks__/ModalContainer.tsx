import { Props } from "../ModalContainer";

export function ModalContainer({ title, toggleModal, children }: Props) {
  function handleClose() {
    toggleModal();
  }

  return (
    <div >
      <h2 data-testid="modal-heading">{title}</h2>
      <button aria-label="Close modal" onClick={handleClose}>
        X
      </button>
      <div>{children}</div>
    </div>
  );
}
