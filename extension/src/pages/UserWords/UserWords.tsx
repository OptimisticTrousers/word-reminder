import {
  User,
  UserWord as IUserWord,
  Word as IWord,
  Detail,
  Column,
} from "common";
import { Download, Import } from "lucide-react";
import {
  ChangeEvent,
  FormEvent,
  MouseEvent,
  useContext,
  useRef,
  useState,
} from "react";
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
import { userWordService } from "../../services/user_word_service";
import { ErrorResponse } from "../../types";
import { download } from "../../utils/download";
import styles from "./UserWords.module.css";
import { useContextMenu } from "../../hooks/useContextMenu";

export const UserWords = CSSModules(
  function () {
    const { showNotification } = useContext(NotificationContext);
    const { showNotificationError } = useNotificationError();
    const { user }: { user: User } = useOutletContext();
    const userId = String(user.id);
    const inputRef = useRef(null);
    const submitButtonRef = useRef(null);
    useContextMenu({ inputRef, submitButtonRef });
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
      queryKey: ["userWords", searchParamsObject],
      placeholderData: keepPreviousData,
      queryFn: () => {
        return userWordService.getUserWordList({
          userId,
          params: searchParamsObject,
        });
      },
    });

    const json = data?.json;

    const { isPending, mutate } = useMutation({
      onMutate: (data) => {
        return { formData: data.formData };
      },
      mutationFn: userWordService.createUserWord,
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
          queryKey: ["userWords"],
        });
      },
      onError: (response: ErrorResponse) => {
        showNotificationError(response);
      },
    });

    const disabled = isPending;

    async function handleExport(event: MouseEvent<HTMLInputElement>) {
      event.preventDefault();
      const { json } = await userWordService.getUserWordList({
        userId,
        params: Object.fromEntries(
          new URLSearchParams({
            page: "1",
            limit: data?.json.totalRows,
            search: "",
            learned: "",
            column: "",
            direction: "",
          })
        ),
      });
      const words = json.userWords.map(
        (userWord: IUserWord & { details: Detail[] }) => {
          return userWord.details[0].word;
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
      mutate({ userId, formData: formData });
    }

    function handleFile(event: ChangeEvent<HTMLInputElement>) {
      setFile(event.target.files![0]);
    }

    function handleQuery(event: FormEvent<HTMLFormElement>) {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      const newSearchParams = new URLSearchParams({
        search: formData.get("search") as string,
        learned: formData.get("learned") as string,
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
                    ref={inputRef}
                    autoFocus
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
                ref={submitButtonRef}
                disabled={disabled}
              >
                Add
              </button>
            </form>
            <form styleName="words__form" onSubmit={handleQuery}>
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
              <fieldset styleName="words__sort sort">
                <label styleName="sort__label">
                  Sort by:
                  <select
                    styleName="sort__select"
                    disabled={disabled}
                    onChange={handleSelectChange}
                  >
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
const WORD_NOTIFICATION_MSGS = {
  addWord: () => {
    return "You have successfully added a word to your dictionary.";
  },
  addWords: () => {
    return "You have successfully added multiple words to your dictionary.";
  },
  fileSize: () => {
    return "File is too big. Max size is 1 MB.";
  },
  missingWordInput: () => {
    return "Please type a word or upload a CSV file of words.";
  },
};
