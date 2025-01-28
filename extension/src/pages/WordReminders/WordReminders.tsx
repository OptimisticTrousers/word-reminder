import { User, WordReminder as IWordReminder } from "common";
import CSSModules from "react-css-modules";
import { useOutletContext, useSearchParams } from "react-router-dom";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { PaginatedList } from "../../components/ui/PaginatedList";
import { wordReminderService } from "../../services/word_reminder_service/word_reminder_service";
import styles from "./WordsByDurations.module.css";

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
        <CreateWordReminder />
        <form styleName="word-reminder__form" action={handleQuery}>
          <div styleName="word-reminder__control">
            <label styleName="word-reminder__label">
              Sort by:
              <select
                styleName="word-reminder__select"
                name="created_at"
                required={true}
              >
                <option styleName="word-reminder__option" value="">
                  Featured
                </option>
                <option styleName="word-reminder__option" value="1">
                  Newest
                </option>
                <option styleName="word-reminder__option" value="-1">
                  Oldest
                </option>
              </select>
            </label>
          </div>
          <button styleName="word-reminder__button" type="submit">
            Filter
          </button>
        </form>
        <PaginatedList
          name="Words"
          totalRows={json && json.totalRows}
          list={
            json &&
            json.wordReminders.map(function (wordReminder: IWordReminder) {
              return <WordReminder key={wordReminder.id} {...wordReminder} />;
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
