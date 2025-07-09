import CSSModules from "react-css-modules";

import { WordReminder as WordReminderItem } from "../../components/word_reminders/WordReminder";
import styles from "./WordReminder.module.css";
import { useQuery } from "@tanstack/react-query";
import { useOutletContext, useParams } from "react-router-dom";
import { wordReminderService } from "../../services/word_reminder_service";
import { User } from "common";
import { Loading } from "../../components/ui/Loading";
import { Error500 } from "../Error500";

export const WordReminder = CSSModules(
  function () {
    const { user }: { user: User } = useOutletContext();
    const userId = String(user.id);
    const { wordReminderId } = useParams();
    const { data, failureReason, isLoading } = useQuery({
      queryKey: ["wordReminders", wordReminderId],
      queryFn: () => {
        return wordReminderService.getWordReminder({
          userId,
          wordReminderId: String(wordReminderId),
        });
      },
    });

    if (failureReason) {
      return <Error500 message={failureReason.message} />;
    }

    if (isLoading) {
      return <Loading />;
    }

    return <WordReminderItem wordReminder={data?.json.wordReminder} />;
  },
  styles,
  { allowMultiple: true, handleNotFoundStyleName: "log" }
);
