import CSSModules from "react-css-modules";
import styles from "./Words.module.css";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Word from "../../components/Word/Word";
import { TfiImport } from "react-icons/tfi";
import { HiFilter } from "react-icons/hi";
import { FaSort } from "react-icons/fa";
import { useState } from "react";

const schema = z.object({
  word: z.string({
    required_error: "Word is required",
    invalid_type_error: "Wordmust be a string",
  }),
});

const Words = CSSModules(
  () => {
    const { register, handleSubmit, formState: { errors } } = useForm({
      defaultValues: {
        word: "",
      }, resolver: zodResolver(schema)
    });

    const onSubmit = handleSubmit((data) => {
      console.log(data)
    });

    const [isSortOpen, setIsSortOpen] = useState(false);

    const handleSort = () => {
      setIsSortOpen((prevValue) => !prevValue);
    }

    return (
      <div styleName="words">
        <div styleName="words__top">
          <button styleName="words__export">
            <TfiImport styleName="words__icon" />
            Import Words</button>
          <h2>Your words</h2>
          <form styleName="words__form" onSubmit={onSubmit}>
            <div styleName="words__control">
              <input
                {...register("word", { required: true })}
                placeholder="Add word..."
                styleName="words__input" />
              <p styleName="words__error">{errors.word?.message}</p>
            </div>
            <button styleName="words__button words__button--add" type="submit">ADD</button>
          </form>
        </div>
        <div styleName="words__filter">
          <div styleName="words__buttons">
            <button styleName="words__button words__button--sort" onClick={handleSort}>
              <FaSort styleName="words__icon words__icon--sort" />
              Sort
            </button>
            <button styleName="words__button words__button--filter">
              <HiFilter styleName="words__icon words__icon--filter" />
              Filter
            </button>
          </div>
          <div styleName={`words__sort words__sort--${isSortOpen && "active"}`}>
            <ul styleName="words__options">
              <li styleName="words__option">
                <button styleName="words__button words__button--option">
                  Sort by A-Z
                </button>
              </li>
              <li styleName="words__option">
                <button styleName="words__button words__button--option">
                  Sort by Z-A
                </button>
              </li>
              <li styleName="words__option">
                <button styleName="words__button words__button--option">
                  Newest
                </button>
              </li>
              <li styleName="words__option">
                <button styleName="words__button words__button--option">
                  Oldest
                </button>
              </li>
            </ul>
          </div>
        </div>
        <div styleName="words__list">
          <Word />
          <Word />
          <Word />
          <Word />
        </div>
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
