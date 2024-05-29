import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import CSSModules from "react-css-modules";
import { useForm } from "react-hook-form";
import { FaSort } from "react-icons/fa";
import { HiFilter } from "react-icons/hi";
import { TfiImport } from "react-icons/tfi";
import { toast } from "react-toastify";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as z from "zod";
import { ErrorMessage, NoMore, UserWord } from "../../components";
import { IUserWord } from "../../context/AuthContext";
import useAuth from "../../hooks/useAuth";
import useHttp from "../../hooks/useHttp";
import { useKeyboardNavigation } from "../../hooks/useKeyboardNavigation";
import useMenuCloseEvents from "../../hooks/useMenuCloseEvents";
import useUserWords from "../../hooks/useUserWords";
import { Navigation } from "../../layouts";
import styles from "./Words.module.css";

const MAX_FILE_SIZE = 500000;
const ACCEPTED_FILE_TYPES = [".csv", "text/csv"];

const userWordSchema = z
  .object({
    word: z.string().optional(),
    csv: z
      .any()
      .optional()
      .refine(
        (files) =>
          !files || files.length === 0 || files[0].size <= MAX_FILE_SIZE,
        "Max file size is 5 MB."
      )
      .refine(
        (files) =>
          !files ||
          files.length === 0 ||
          ACCEPTED_FILE_TYPES.includes(files[0].type),
        "Only .csv files are accepted."
      ),
  })
  .refine(
    (data) => data.word || (data.csv && data.csv.length > 0),
    "Either 'word' or 'csv' must be provided."
  );

const querySchema = z.object({
  search: z.string({
    invalid_type_error: "Search must be a string",
  }),
  learned: z.boolean({
    invalid_type_error: "Learned must be a boolean",
  }),
  sort: z.string({
    invalid_type_error: "Sort must be a string",
  }),
});

type UserWordSchema = z.infer<typeof userWordSchema>;
type QuerySchema = z.infer<typeof querySchema>;

const Words = CSSModules(
  () => {
    const [isSortOpen, setIsSortOpen] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const handleFilter = () => {
      setIsFilterOpen((prevValue) => !prevValue);
    };

    const handleSort = () => {
      setIsSortOpen((prevValue) => !prevValue);
    };

    const closeSortDropdown = () => {
      setIsSortOpen(false);
    };

    const closeFilterDropdown = () => {
      setIsFilterOpen(false);
    };

    const sortDropdownId = "SortDropdown";
    const sortButtonId = "SortBtnDropdown";

    const filterDropdownId = "FilterDropdown";
    const filterButtonId = "FilterBtnDropdown";

    useKeyboardNavigation(sortDropdownId);
    useMenuCloseEvents(sortDropdownId, sortButtonId, closeSortDropdown);

    useKeyboardNavigation(filterDropdownId);
    useMenuCloseEvents(filterDropdownId, filterButtonId, closeFilterDropdown);

    const {
      register: userWordRegister,
      handleSubmit: userWordHandleSubmit,
      formState: { errors: userWordErrors },
    } = useForm<UserWordSchema>({
      resolver: zodResolver(userWordSchema),
    });

    const {
      register: queryRegister,
      watch,
      formState: { errors: queryErrors },
    } = useForm<QuerySchema>({
      resolver: zodResolver(querySchema),
    });

    const {
      state: { user },
    } = useAuth();

    const { learned, sort, search } = watch();
    const queryClient = useQueryClient();

    const { post } = useHttp();

    const { userWords, userWordsStatus, userWordsError } = useUserWords({
      learned,
      sort,
      search,
    });

    const userId = user!._id;
    const { status: createdUserWordStatus, mutate: createdUserWordMutate } =
      useMutation({
        mutationFn: (data: UserWordSchema) => {
          return post(
            `${import.meta.env.VITE_API_DOMAIN}/users/${userId}/words`,
            data
          );
        },
        onSettled: (data) => {
          const username = user!.username;
          if (data.message) {
            toast.error(data.message);
          } else if (data.status) {
            toast.error(
              `An unknown ${data.status} error occured while creating a new word.`
            );
          } else {
            if (data.valid && data.invalid) {
              toast.success(
                `You have successfully created ${data.valid.length} new word(s), but ${data.invalid} words were not inserted, ${username}!`
              );
            } else {
              toast.success(
                `You have successfully created a new word, ${username}!`
              );
            }
            queryClient.invalidateQueries({
              queryKey: [userId, "words", { learned, search, sort }],
            });
          }
        },
      });

    const onSubmit = (data: UserWordSchema) => {
      createdUserWordMutate(data);
    };

    const disabled = createdUserWordStatus === "pending";

    return (
      <div styleName="words">
        <div styleName="words__top">
          <Navigation />
          <div styleName="words__container">
            <form
              styleName="words__form"
              onSubmit={userWordHandleSubmit(onSubmit)}
            >
              <div styleName="words__control">
                <label htmlFor="csv" styleName="words__label">
                  <input
                    styleName="words__button words__button--import"
                    {...userWordRegister("csv")}
                    type="file"
                    disabled={disabled}
                  />
                  <TfiImport styleName="words__icon" />
                  Import Words
                </label>
                {userWordErrors.csv?.message && (
                  <ErrorMessage
                    message={userWordErrors.csv.message.toString()}
                  />
                )}
              </div>
              <div styleName="words__control">
                <input
                  {...userWordRegister("word")}
                  type="search"
                  placeholder="Add word..."
                  styleName="words__input words__input--add"
                />
                {userWordErrors.word?.message && (
                  <ErrorMessage message={userWordErrors.word.message} />
                )}
              </div>
              <button
                styleName="words__button words__button--add"
                type="submit"
                disabled={disabled}
              >
                ADD
              </button>
            </form>
            <div styleName="words__container">
              <div styleName="words__inputs">
                <input
                  {...queryRegister("search")}
                  placeholder="Search for words in your collection..."
                  styleName="words__input words__input--search"
                />
                <div styleName="words__buttons">
                  <button
                    styleName="words__button words__button--sort"
                    onClick={handleSort}
                    aria-controls={sortDropdownId}
                    aria-haspopup="true"
                    aria-expanded={isSortOpen}
                    aria-label="Open sort options menu"
                    id={sortButtonId}
                  >
                    <FaSort styleName="words__icon words__icon--sort" />
                    Sort
                  </button>
                  <button
                    styleName="words__button words__button--filter"
                    onClick={handleFilter}
                    aria-controls={filterDropdownId}
                    aria-haspopup="true"
                    aria-expanded={isFilterOpen}
                    aria-label="Open filter options menu"
                    id={filterButtonId}
                  >
                    <HiFilter styleName="words__icon words__icon--filter" />
                    Filter
                  </button>
                </div>
              </div>
            </div>
          </div>
          <ul
            styleName={`words__options ${isSortOpen && "words__options--active"}
         words__options--sort`}
            role="menu"
            aria-label="Sort options"
            id={sortDropdownId}
          >
            <li role="none" styleName="words__triangle"></li>
            <li role="none" styleName="words__error">
              {queryErrors.sort?.message && (
                <ErrorMessage message={queryErrors.sort.message} />
              )}
            </li>
            <li styleName="words__option" role="menuitem">
              <input
                {...queryRegister("sort")}
                id="bestMatch"
                type="radio"
                value=""
                styleName="words__radio"
              />
              <label styleName="words__label" htmlFor="bestMatch">
                Best Match
              </label>
            </li>
            <li styleName="words__option" role="menuitem">
              <input
                {...queryRegister("sort")}
                id="a-z"
                type="radio"
                value="a-z"
                styleName="words__radio"
              />
              <label styleName="words__label" htmlFor="a-z">
                Sort by A-Z
              </label>
            </li>
            <li styleName="words__option" role="menuitem">
              <input
                {...queryRegister("sort")}
                id="z-a"
                type="radio"
                value="z-a"
                styleName="words__radio"
              />
              <label styleName="words__label" htmlFor="z-a">
                Sort by Z-A
              </label>
            </li>
            <li styleName="words__option" role="menuitem">
              <input
                {...queryRegister("sort")}
                id="newest"
                type="radio"
                value="newest"
                styleName="words__radio"
              />
              <label styleName="words__label" htmlFor="newest">
                Newest
              </label>
            </li>
            <li styleName="words__option" role="menuitem">
              <input
                {...queryRegister("sort")}
                id="oldest"
                value="oldest"
                type="radio"
                styleName="words__radio"
              />
              <label styleName="words__label" htmlFor="oldest">
                Oldest
              </label>
            </li>
          </ul>
          <ul
            styleName={`words__options words__options--${
              isFilterOpen && "active"
            } words__options--filter`}
            role="menu"
            aria-label="Filter options"
            id={filterDropdownId}
          >
            <li role="none" styleName="words__error">
              {queryErrors.learned?.message && (
                <ErrorMessage message={queryErrors.learned.message} />
              )}
            </li>
            <li role="none" styleName="words__triangle"></li>
            <li styleName="words__option" role="menuitem">
              <input
                {...queryRegister("learned")}
                id="any"
                type="radio"
                styleName="words__radio"
                value=""
              />
              <label styleName="words__label" htmlFor="any">
                Any
              </label>
            </li>
            <li styleName="words__option" role="menuitem">
              <input
                {...queryRegister("learned")}
                type="radio"
                styleName="words__radio"
                id="learned"
                value="true"
              />
              <label styleName="words__label" htmlFor="learned">
                Learned
              </label>
            </li>
            <li styleName="words__option" role="menuitem">
              <input
                {...queryRegister("learned")}
                type="radio"
                styleName="words__radio"
                id="unlearned"
                value="false"
              />
              <label styleName="words__label" htmlFor="unlearned">
                Unlearned
              </label>
            </li>
          </ul>
        </div>
        <div styleName="words__list">
          {userWordsStatus === "success" &&
            userWords &&
            userWords.map((userWord: IUserWord) => {
              return <UserWord key={userWord._id} {...userWord} />;
            })}
          {userWordsStatus === "success" && !userWords && (
            <NoMore
              title={"No more words"}
              description={
                "Add more words to see more words in your collection"
              }
            />
          )}
          {userWordsStatus === "error" && userWordsError && (
            <ErrorMessage message={userWordsError.message} />
          )}
        </div>
      </div>
    );
  },
  styles,
  {
    allowMultiple: true,
    handleNotFoundStyleName: "ignore",
  }
);

export default Words;
