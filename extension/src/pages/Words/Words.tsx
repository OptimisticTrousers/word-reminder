/* eslint-disable @typescript-eslint/no-explicit-any */
import CSSModules from "react-css-modules";
import styles from "./Words.module.css";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
// import Word from "../../components/Word/Word";
import { TfiImport } from "react-icons/tfi";
import { HiFilter } from "react-icons/hi";
import { FaSort } from "react-icons/fa";
import { useState } from "react";
import { useKeyboardNavigation } from "../../hooks/useKeyboardNavigation";
import useMenuCloseEvents from "../../hooks/useMenuCloseEvents";
import { Navigation } from "../../layouts";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

const schema = z.object({
  word: z.string({
    required_error: "Word is required",
    invalid_type_error: "Wordmust be a string",
  }),
});

const Words = CSSModules(
  () => {
    const {
      register,
      handleSubmit,
      formState: { errors },
    } = useForm({
      defaultValues: {
        word: "",
        filter: "",
        radio: "",
        search: "",
      },
      resolver: zodResolver(schema),
    });

    // const {data, status, error} = useQuery({queryKey: ["words", ], queryFn: () => {
    //   return axios.get(`${import.meta.env.VITE_API_DOMAIN}/words`)
    // }})

    const { data, status, error, mutate }: any = useMutation({
      mutationFn: (formData) => {
        return axios.post(`${import.meta.env.VITE_API_DOMAIN}/words`, formData);
      },
    });
    console.log(data);
    console.log(status);
    console.log(error);

    const onSubmit = handleSubmit(mutate);

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

    return (
      <div styleName="words">
        <div styleName="words__top">
          <Navigation />
          <div styleName="words__container">
            <form styleName="words__form" onSubmit={onSubmit}>
              <div styleName="words__control">
                <input
                  {...register("word", { required: true })}
                  placeholder="Add word..."
                  styleName="words__input words__input--add"
                />
                <p styleName="words__error">{errors.word?.message}</p>
              </div>
              <button
                styleName="words__button words__button--add"
                type="submit"
              >
                ADD
              </button>
            </form>
            <div styleName="words__container">
              <div styleName="words__inputs">
                <input
                  {...register("search")}
                  placeholder="Search for words in your collection..."
                  styleName="words__input words__input--search"
                />
                <div styleName="words__buttons">
                  <button styleName="words__button words__button--import">
                    <TfiImport styleName="words__icon" />
                    Import Words
                  </button>
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
            styleName={`words__options words__options--${
              isSortOpen && "active"
            } words__options--sort`}
            role="menu"
            aria-label="Sort options"
            id={sortDropdownId}
          >
            <li role="none" styleName="words__triangle"></li>
            <li styleName="words__option" role="menuitem">
              <button styleName="words__button words__button--option">
                Sort by A-Z
              </button>
            </li>
            <li styleName="words__option" role="menuitem">
              <button styleName="words__button words__button--option">
                Sort by Z-A
              </button>
            </li>
            <li styleName="words__option" role="menuitem">
              <button styleName="words__button words__button--option">
                Newest
              </button>
            </li>
            <li styleName="words__option" role="menuitem">
              <button styleName="words__button words__button--option">
                Oldest
              </button>
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
            <li role="none" styleName="words__triangle"></li>
            <li styleName="words__option" role="menuitem">
              <input
                {...register("radio")}
                id="any"
                type="radio"
                styleName=""
                value="Any"
              />
              <label styleName="words__label" htmlFor="any">
                Any
              </label>
            </li>
            <li styleName="words__option" role="menuitem">
              <input
                {...register("radio")}
                type="radio"
                styleName=""
                value="Learned"
              />
              <label styleName="words__label" htmlFor="learned">
                Learned
              </label>
            </li>
            <li styleName="words__option" role="menuitem">
              <input
                {...register("radio")}
                type="radio"
                styleName=""
                value="Unlearned"
              />
              <label styleName="words__label" htmlFor="unlearned">
                Unlearned
              </label>
            </li>
          </ul>
        </div>
        <div styleName="words__list">{}</div>
      </div>
    );
  },
  styles,
  {
    allowMultiple: true,
    handleNotFoundStyleName: "log",
  }
);

export default Words;
