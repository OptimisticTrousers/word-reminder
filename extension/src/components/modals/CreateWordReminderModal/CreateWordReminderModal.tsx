import { useContext, FormEvent } from "react";
import CSSModules from "react-css-modules";
import { useMutation, useQuery } from "@tanstack/react-query";

import { ThemeContext } from "../../../context/Theme";
import { ModalContainer } from "../ModalContainer";
import styles from "./CreateWordsByDuration.module.css";

interface Props {
  toggleModal: () => void;
}

export const CreateWordReminderModal = CSSModules(
  function ({ toggleModal }: Props) {
    const { theme } = useContext(ThemeContext);

    function handleSubmit(event: FormEvent<HTMLFormElement>) {}

    return (
      <ModalContainer
        title="Create Words By Duration"
        toggleModal={toggleModal}
      >
        <form styleName="modal__form" onSubmit={handleSubmit}>
          <fieldset styleName="modal__words">
            <button>Select All</button>
            <button>Deselect All</button>
            <legend>Words</legend>
            {userWordsStatus === "success" &&
              userWords.map((userWord: any) => {
                const { word } = userWord.word;
                return (
                  <div styleName="modal__control">
                    <input
                      type="checkbox"
                      id={userWord._id}
                      name={word}
                      value={word}
                    />
                    <label htmlFor={word}>{word}</label>
                  </div>
                );
              })}
          </fieldset>
          <fieldset>
            <legend>Times</legend>
            <div styleName="words-by-durations__control">
              <label htmlFor="from">From</label>
              <input
                type="datetime-local"
                {...(register("from"), { required: true })}
              />
            </div>
            <div styleName="words-by-durations__control">
              <label htmlFor="to">To</label>
              <input
                type="datetime-local"
                {...register("to", { required: true })}
              />
            </div>
          </fieldset>
          <fieldset styleName="words-by-durations__options">
            <legend>Options</legend>
            <div styleName="words-by-durations__control">
              <input type="checkbox" {...register("options.isActive")} />
              <label htmlFor="isActive">Is Active</label>
            </div>
            <div styleName="words-by-durations__control">
              <input
                type="checkbox"
                {...register("options.hasReminderOnLoad")}
              />
              <label htmlFor="hasReminderOnLoad">Has Reminder On Load</label>
            </div>
            <div styleName="words-by-durations__control">
              <input
                type="checkbox"
                {...register("options.hasDuplicateWords")}
              />
              <label htmlFor="hasDuplicateWords">Has Duplicate Words</label>
            </div>
            <div styleName="words-by-durations__control">
              <input
                type="checkbox"
                {...register("options.recurring.isRecurring")}
              />
              <label htmlFor="isRecurring">Is Recurring</label>
            </div>
            <div styleName="words-by-durations__control">
              <input type="text" {...register("options.recurring.interval")} />
              <label htmlFor="interval">Interval</label>
            </div>
            <div styleName="words-by-durations__control">
              <input type="text" {...register("options.reminder")} />
              <label htmlFor="reminder">Reminder</label>
            </div>
          </fieldset>
          <div styleName="modal__buttons">
            <button
              styleName="modal__button modal__button--submit"
              disabled={status === "pending"}
              type="submit"
            >
              {status === "pending" ? "Creating..." : "Create"}
            </button>
            <button
              styleName="modal__button modal__button--random"
              type="button"
              onClick={createRandomWordsByDuration}
            >
              Random Default
            </button>
          </div>
        </form>
      </ModalContainer>
    );
  },
  styles,
  { allowMultiple: false, handleNotFoundStyleName: "log" }
);
