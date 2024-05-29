/* eslint-disable @typescript-eslint/no-explicit-any */
import CSSModules from "react-css-modules";
import styles from "./UserWord.module.css";
import { MdDelete } from "react-icons/md";
import { BsInfoCircleFill } from "react-icons/bs";
import { FC, useRef, useState } from "react";
import useHttp from "../../hooks/useHttp";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Word } from "..";
import { IUserWord } from "../../context/AuthContext";

const UserWord: FC<IUserWord> = CSSModules(
  (props) => {
    const accordion = useRef<HTMLDivElement | null>(null);
    const [isAccordionOpen, setIsAccordionOpen] = useState(false);
    const { remove } = useHttp();

    const handleAccordion = () => {
      setIsAccordionOpen((prevValue) => !prevValue);
      if (accordion.current) {
        accordion.current.style.maxHeight =
          accordion.current?.style.maxHeight !== "0px"
            ? `0px`
            : `${accordion.current?.scrollHeight}px`;
      }
    };

    const { data, status, error, mutate } = useMutation({
      mutationFn: () => {
        return remove(
          `${
            import.meta.env.VITE_API_DOMAIN
          }/users/665164760636f4834e053388/words/${props.word._id}`
        );
      },
      onSuccess: () => {
        toast.success("You have successfully deleted a word!");
      },
      onError: (error) => {
        console.error(error);
        toast.error("An unknown error occured while deleting a post.");
      },
    });

    const handleDelete = () => {
      mutate();
    };

    return (
      <div styleName="user-word">
        <article styleName="user-word__word word">
          <p styleName="word__name">{props.word.word}</p>
          <div styleName="word__divider"></div>
          <div styleName="word__buttons">
            <button
              styleName="word__button word__button--info"
              onClick={handleAccordion}
            >
              <BsInfoCircleFill styleName="word__icon" />
            </button>
            <button
              styleName="word__delete word__button--delete"
              onClick={handleDelete}
            >
              <MdDelete styleName="word__icon" />
            </button>
          </div>
        </article>
        <div
          ref={accordion}
          styleName={`user-word__panel ${
            isAccordionOpen && "user-word__panel--active"
          }`}
        >
          <Word {...props} />
        </div>
      </div>
    );
  },
  styles,
  { allowMultiple: true, handleNotFoundStyleName: "ignore" }
);

export default UserWord;
