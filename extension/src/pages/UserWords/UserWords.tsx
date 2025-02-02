import { User, UserWord as IUserWord, Word as IWord } from "common";
import { Download, Import } from "lucide-react";
import { ChangeEvent, MouseEvent, useContext, useState } from "react";
import CSSModules from "react-css-modules";
import { useOutletContext, useSearchParams } from "react-router-dom";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { PaginatedList } from "../../components/ui/PaginatedList";
import { UserWord } from "../../components/words/UserWord";
import {
  NOTIFICATION_ACTIONS,
  NotificationContext,
} from "../../context/Notification";
import { useNotificationError } from "../../hooks/useNotificationError";
import { wordService } from "../../services/word_service/word_service";
import { ErrorResponse } from "../../types";
import { download } from "../../utils/download";
import styles from "./UserWords.module.css";

export const UserWords = CSSModules(
  function () {
    const { showNotification } = useContext(NotificationContext);
    const { showNotificationError } = useNotificationError();
    const { user }: { user: User } = useOutletContext();
    const userId = user.id;
    const [file, setFile] = useState<File | null>(null);
    const [searchParams, setSearchParams] = useSearchParams({
      page: "1",
      limit: PAGINATION_LIMIT,
      search: "",
      learned: "",
      column: "",
      direction: "",
    });
    const queryClient = useQueryClient();
    const searchParamsObject = Object.fromEntries(searchParams);

    const { data, error, isLoading, isSuccess } = useQuery({
      queryKey: ["words", searchParamsObject],
      placeholderData: keepPreviousData,
      queryFn: () => {
        return wordService.getWordList(userId, searchParamsObject);
      },
      staleTime: STALE_TIME,
    });

    const json = data?.json;

    const { isPending, mutate } = useMutation({
      onMutate: (data) => {
        return { formData: data.formData };
      },
      mutationFn: wordService.createWord,
      onSuccess: (_response, _variables, context) => {
        const formData = context.formData;
        const word = formData.get("word") as string;
        if (file && file.size > 0) {
          showNotification(
            NOTIFICATION_ACTIONS.SUCCESS,
            WORD_NOTIFICATION_MSGS.addWords()
          );
        } else if (word.length > 0) {
          showNotification(
            NOTIFICATION_ACTIONS.SUCCESS,
            WORD_NOTIFICATION_MSGS.addWord()
          );
        }
        queryClient.invalidateQueries({
          queryKey: ["words", searchParamsObject],
          exact: true,
        });
      },
      onError: (response: ErrorResponse) => {
        showNotificationError(response);
      },
    });

    const disabled = isPending;

    async function handleExport(event: MouseEvent<HTMLInputElement>) {
      event.preventDefault();
      const { json } = await wordService.getWordList(
        userId,
        Object.fromEntries(
          new URLSearchParams({
            page: "1",
            limit: data?.json.totalRows,
            search: "",
            learned: "",
            column: "",
            direction: "",
          })
        )
      );
      const words = json.userWords.map(
        (userWord: IUserWord & { word: string }) => {
          return userWord.word;
        }
      );
      download({
        data: words.join(","),
        fileName: "words.csv",
        fileType: "text/csv",
      });
    }

    function handleAdd(formData: FormData) {
      const word = formData.get("word") as string;
      formData.append("userId", userId);
      if (!file && word.length === 0) {
        showNotification(
          NOTIFICATION_ACTIONS.ERROR,
          WORD_NOTIFICATION_MSGS.missingWordInput()
        );
        return;
      } else if (file && file.size > MAX_FILE_SIZE) {
        showNotification(
          NOTIFICATION_ACTIONS.ERROR,
          WORD_NOTIFICATION_MSGS.fileSize()
        );
        return;
      }
      mutate({ userId, formData });
    }

    function handleFile(event: ChangeEvent<HTMLInputElement>) {
      setFile(event.target.files![0]);
    }

    function handleQuery(formData: FormData) {
      const newSearchParams = new URLSearchParams({
        search: formData.get("search") as string,
        learned: formData.get("learned") as string,
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

    return (
      <section styleName="words">
        <div styleName="words__top">
          <div styleName="words__container">
            <form styleName="words__form" action={handleAdd}>
              <div styleName="words__control">
                <label styleName="words__label">
                  Word
                  <input
                    name="word"
                    type="text"
                    placeholder="Add a new word to your dictionary..."
                    styleName="words__input words__input--add"
                    maxLength={MAX_WORD_LENGTH}
                    disabled={disabled}
                  />
                </label>
              </div>
              <div styleName="words__control">
                <label styleName="words__label">
                  Import Words
                  <Import styleName="word__icon" />
                  <input
                    styleName="words__button words__button--import"
                    type="file"
                    accept="text/csv"
                    name="csv"
                    disabled={disabled}
                    onChange={handleFile}
                  />
                </label>
              </div>
              <button
                styleName="words__button words__button--add"
                type="submit"
                disabled={disabled}
              >
                Add
              </button>
            </form>
            <form styleName="words__form" action={handleQuery}>
              <div styleName="words__control">
                <label styleName="words__label">
                  Export Words
                  <Download styleName="word__icon" />
                  <input
                    styleName="words__button words__button--import"
                    type="button"
                    disabled={disabled}
                    onClick={handleExport}
                  />
                </label>
              </div>
              <div styleName="words__control">
                <label styleName="words__label">
                  Search
                  <input
                    placeholder="Search for words in your dictionary..."
                    styleName="words__input words__input--search"
                    type="search"
                    name="search"
                    disabled={disabled}
                  />
                </label>
              </div>
              <div styleName="words__control">
                <label styleName="words__label">
                  Sort by:
                  <select
                    styleName="words__select"
                    disabled={disabled}
                    name="created_at"
                  >
                    <option styleName="words__option" value="">
                      Featured
                    </option>
                    <option styleName="words__option" value="1">
                      Newest
                    </option>
                    <option styleName="words__option" value="-1">
                      Oldest
                    </option>
                  </select>
                </label>
              </div>
              <div styleName="words__control">
                <label styleName="words__label">
                  Filter by:
                  <select
                    styleName="words__select"
                    disabled={disabled}
                    name="learned"
                  >
                    <option styleName="words__option" value="">
                      Any
                    </option>
                    <option styleName="words__option" value="true">
                      Learned
                    </option>
                    <option styleName="words__option" value="false">
                      Unlearned
                    </option>
                  </select>
                </label>
              </div>
              <button
                styleName="words__button words__button--add"
                type="submit"
                disabled={disabled}
              >
                Filter
              </button>
            </form>
          </div>
        </div>
        <PaginatedList
          name="Words"
          totalRows={json && json.totalRows}
          list={
            json &&
            json.userWords.map(function (userWord: IUserWord & IWord) {
              return <UserWord key={userWord.id} {...userWord} />;
            })
          }
          isLoading={isLoading}
          isSuccess={isSuccess}
          error={error}
          previous={json && json.previous}
          next={json && json.next}
        />
      </section>
    );
  },
  styles,
  {
    allowMultiple: true,
    handleNotFoundStyleName: "log",
  }
);

const MAX_FILE_SIZE = 1000 * 1024; // 1 MB
const MAX_WORD_LENGTH = 45;
const PAGINATION_LIMIT = "10";
const STALE_TIME = 30000; // 30 seconds in milliseconds
const WORD_NOTIFICATION_MSGS = {
  addWord: () => {
    return "You have successfully added a word to your dictionary.";
  },
  addWords: () => {
    return "You have successfully multiple words to your dictionary.";
  },
  fileSize: () => {
    return "File is too big. Max size is 1 MB.";
  },
  missingWordInput: () => {
    return "Please type a word or upload a CSV file of words.";
  },
};
