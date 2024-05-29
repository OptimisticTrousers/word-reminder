/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useContext, FormEvent } from "react";
import CSSModules from "react-css-modules";
import ModalContainer from "../ModalContainer";
import styles from "./CreateWordsByDuration.module.css";
import { useMutation, useQuery } from "@tanstack/react-query";
import useHttp from "../../hooks/useHttp";
import { ThemeContext } from "../../context/ThemeContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "react-toastify";

interface Props {
  toggleModal: () => void;
}

const schema = z.object({
  from: z.string().datetime({
    message: "Invalid datetime string! Must be UTC.",
  }),
  to: z.string().datetime({
    message: "Invalid datetime string! Must be UTC.",
  }),
});

const CreateWordsByDurationModal: FC<Props> = CSSModules(
  ({ toggleModal }) => {
    const { theme } = useContext(ThemeContext);

    const { get, post } = useHttp();
    const {
      data: userWords,
      status: userWordsStatus,
      error: userWordsError,
    } = useQuery({
      queryKey: ["words"],
      queryFn: () => {
        return get(
          `${
            import.meta.env.VITE_API_DOMAIN
          }/users/665164760636f4834e053388/words`
        );
      },
    });

    const {
      register,
      handleSubmit,
      formState: { errors },
    } = useForm({
      defaultValues: {
        words: userWords,
        from: "",
        to: "",
        options: {
          isActive: true,
          hasReminderOnLoad: false,
          hasDuplicateWords: false,
          recurring: {
            isRecurring: false,
            interval: "7 days",
          },
          reminder: "4 hours",
        },
      },
      resolver: zodResolver(schema),
    });

    const { data, status, error, mutate }: any = useMutation({
      mutationFn: (formData) => {
        return post(`${import.meta.env.VITE_API_DOMAIN}`, formData);
      },
      onSuccess: () => {
        toast.success("You have successfully created a words by duration!");
      },
      onError: (error) => {
        console.log(error);
        toast.error("There was an issue with creating a words by duration!");
      },
    });

    console.log(userWords);

    const onSubmit = handleSubmit((data) => {
      console.log(data);
      mutate(data);
    });

    const createRandomWordsByDuration = () => {};

    return (
      <ModalContainer
        title="Create Words By Duration"
        toggleModal={toggleModal}
      >
        <form styleName="modal__form" onSubmit={onSubmit}>
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
  { allowMultiple: true, handleNotFoundStyleName: "ignore" }
);

export default CreateWordsByDurationModal;
