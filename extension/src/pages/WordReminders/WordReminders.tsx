import {
  User,
  WordReminder as IWordReminder,
  UserWord,
  Word,
  AddToDate,
} from "common";
import CSSModules from "react-css-modules";
import { useOutletContext, useSearchParams } from "react-router-dom";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { CreateWordReminder } from "../../components/word_reminders/CreateWordReminder";
import { PaginatedList } from "../../components/ui/PaginatedList";
import { SortSelect } from "../../components/ui/SortSelect";
import { WordReminder } from "../../components/word_reminders/WordReminder";
import { wordReminderService } from "../../services/word_reminder_service/word_reminder_service";
import styles from "./WordReminders.module.css";
import { AutoCreateWordReminder } from "../../components/word_reminders/AutoCreateWordReminder";

export const WordReminders = CSSModules(
  function () {
    const { user }: { user: User } = useOutletContext();
    const userId = user.id;
    const [searchParams, setSearchParams] = useSearchParams({
      page: "1",
      limit: PAGINATION_LIMIT,
      column: "",
      direction: "",
    });
    const searchParamsObject = Object.fromEntries(searchParams);
    const { data, error, isLoading, isSuccess } = useQuery({
      queryKey: ["wordReminders", searchParamsObject],
      placeholderData: keepPreviousData,
      queryFn: () => {
        return wordReminderService.getWordReminderList(
          userId,
          searchParamsObject
        );
      },
      staleTime: STALE_TIME,
    });

    function handleQuery(formData: FormData) {
      const newSearchParams = new URLSearchParams({
        ...(formData.get("created_at") !== "" && {
          column: "created_at",
        }),
        direction: formData.get("created_at") as string,
      });
      const combined = new URLSearchParams([
        ...searchParams,
        ...newSearchParams,
      ]);
      setSearchParams(combined);
    }

    const json = data?.json;

    return (
      <div styleName="words-reminder">
        <AutoCreateWordReminder searchParams={searchParams} />
        <CreateWordReminder searchParams={searchParams} />
        <form styleName="word-reminder__form" action={handleQuery}>
          <SortSelect disabled={false} required={true} />
          <button styleName="word-reminder__button" type="submit">
            Filter
          </button>
        </form>
        <PaginatedList
          name="Word Reminders"
          totalRows={json && json.totalRows}
          list={
            json &&
            json.wordReminders.map(function (
              wordReminder: IWordReminder & {
                user_words: (UserWord & Word)[];
                reminder: AddToDate;
              }
            ) {
              return (
                <WordReminder
                  key={wordReminder.id}
                  searchParams={searchParams}
                  wordReminder={wordReminder}
                />
              );
            })
          }
          isLoading={isLoading}
          isSuccess={isSuccess}
          error={error}
          previous={json && json.previous}
          next={json && json.next}
        />
      </div>
    );
  },
  styles,
  { allowMultiple: false, handleNotFoundStyleName: "log" }
);

const PAGINATION_LIMIT = "10";
const STALE_TIME = 30000; // 30 seconds in milliseconds
