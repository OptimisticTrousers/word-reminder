import { Props } from "../ModalContainer";

export function ModalContainer({ title, toggleModal, children }: Props) {
  return (
    <div>
      <h2>{title}</h2>
      <button aria-label="Close modal" onClick={toggleModal}>
        X
      </button>
      <div>{children}</div>
    </div>
  );
}
