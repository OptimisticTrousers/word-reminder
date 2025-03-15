import { User, WordReminder as IWordReminder, Detail, Column } from "common";
import CSSModules from "react-css-modules";
import { useOutletContext, useSearchParams } from "react-router-dom";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { CreateWordReminder } from "../../components/word_reminders/CreateWordReminder";
import { PaginatedList } from "../../components/ui/PaginatedList";
import { WordReminder } from "../../components/word_reminders/WordReminder";
import { wordReminderService } from "../../services/word_reminder_service/word_reminder_service";
import styles from "./WordReminders.module.css";
import { AutoCreateWordReminder } from "../../components/word_reminders/AutoCreateWordReminder";
import { ChangeEvent } from "react";

export const WordReminders = CSSModules(
  function () {
    const { user }: { user: User } = useOutletContext();
    const userId = String(user.id);
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
        return wordReminderService.getWordReminderList({
          userId,
          params: searchParamsObject,
        });
      },
    });

    function handleQuery(formData: FormData) {
      const newSearchParams = new URLSearchParams({
        column:
          ((formData.get(Column.CREATED_AT) as string) && Column.CREATED_AT) ||
          ((formData.get(Column.UPDATED_AT) as string) && Column.UPDATED_AT) ||
          "",
        direction:
          (formData.get(Column.CREATED_AT) as string) ||
          (formData.get(Column.UPDATED_AT) as string) ||
          "",
      });
      const combined = new URLSearchParams([
        ...searchParams,
        ...newSearchParams,
      ]);
      setSearchParams(combined);
    }

    function handleSelectChange(event: ChangeEvent<HTMLSelectElement>) {
      const selectElement = event.target;
      const selectedOption = selectElement.selectedOptions[0];
      const optgroup = selectedOption.parentElement as HTMLOptGroupElement;
      const label = optgroup.label;

      let name = "";
      switch (label) {
        case "Created At":
          name = "created_at";
          break;
        case "Updated At":
          name = "updated_at";
          break;
      }

      selectElement.name = name;
    }

    const json = data?.json;

    return (
      <div styleName="words-reminder">
        <AutoCreateWordReminder />
        <CreateWordReminder searchParams={searchParams} />
        <form styleName="word-reminder__form" action={handleQuery}>
          <fieldset styleName="words__sort sort">
            <label styleName="sort__label">
              Sort by:
              <select styleName="sort__select" onChange={handleSelectChange}>
                <option styleName="sort__option" value="">
                  Featured
                </option>
                <optgroup label="Created At">
                  <option styleName="sort__option" value="1">
                    Oldest Created
                  </option>
                  <option styleName="sort__option" value="-1">
                    Newest Created
                  </option>
                </optgroup>
                <optgroup label="Updated At">
                  <option styleName="sort__option" value="1">
                    Oldest Updated
                  </option>
                  <option styleName="sort__option" value="-1">
                    Newest Updated
                  </option>
                </optgroup>
              </select>
            </label>
          </fieldset>
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
                user_words: {
                  details: Detail[];
                  learned: boolean;
                  created_at: Date;
                  updated_at: Date;
                  id: number;
                }[];
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
  { allowMultiple: true, handleNotFoundStyleName: "log" }
);

const PAGINATION_LIMIT = "10";
