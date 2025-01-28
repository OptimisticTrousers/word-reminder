import { UserWord as IUserWord, Word as IWord, User } from "common";
import { Info, Trash } from "lucide-react";
import CSSModules from "react-css-modules";
import { useContext, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";

import { useNotificationError } from "../../../hooks/useNotificationError";
import { Word } from "../Word";
import styles from "./UserWord.module.css";
import { wordService } from "../../../services/word_service";
import { useOutletContext } from "react-router-dom";
import { ErrorResponse } from "../../../types";
import {
  NOTIFICATION_ACTIONS,
  NotificationContext,
} from "../../../context/Notification";

export const UserWord = CSSModules(
  function (props: IUserWord & IWord) {
    const { user }: { user: User } = useOutletContext();
    const { showNotification } = useContext(NotificationContext);
    const userId = user.id;
    const wordId = props.word_id;
    const accordion = useRef<HTMLDivElement | null>(null);
    const { showNotificationError } = useNotificationError();
    const [isAccordionOpen, setIsAccordionOpen] = useState(false);

    const handleAccordion = () => {
      setIsAccordionOpen((prevValue) => !prevValue);
      if (accordion.current) {
        accordion.current.style.maxHeight =
          accordion.current?.style.maxHeight === "0px"
            ? `${accordion.current?.scrollHeight}px`
            : `0px`;
      }
    };

    console.log(props);


    const handleDelete = () => {
      // mutate();
    };

    return (
      <div styleName="user-word">
        <article styleName="user-word__word word">
          {/* <p styleName="word__name">{props.word.word}</p> */}
          <div styleName="word__divider"></div>
          <div styleName="word__buttons">
            <button
              styleName="word__button word__button--info"
              onClick={handleAccordion}
            >
              <Info styleName="word__icon" />
            </button>
            <button
              styleName="word__delete word__button--delete"
              onClick={handleDelete}
            >
              <Trash styleName="word__icon" />
            </button>
          </div>
        </article>
        <div
          ref={accordion}
          styleName={`user-word__panel ${
            isAccordionOpen && "user-word__panel--active"
          }`}
        >
          {/* <Word {...props} /> */}
        </div>
      </div>
    );
  },
  styles,
  { allowMultiple: true, handleNotFoundStyleName: "log" }
);