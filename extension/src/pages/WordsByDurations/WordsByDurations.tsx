import CSSModules from "react-css-modules";
import styles from "./WordsByDurations.module.css";
import { Navigation } from "../../layouts";
import { useQuery } from "@tanstack/react-query";
import useHttp from "../../hooks/useHttp";
import { CreateWordsByDuration, NoMore } from "../../components";

const WordsByDurations = CSSModules(
  () => {
    const { get } = useHttp();
    const {
      data: wordsByDurations,
      status,
      isSuccess,
      isPending,
      error,
    } = useQuery({
      queryKey: ["wordsByDurations"],
      queryFn: () => {
        return get(
          `${
            import.meta.env.VITE_API_DOMAIN
          }/users/665164760636f4834e053388/wordsByDurations`
        );
      },
    });

    console.log(isSuccess, isPending, status, wordsByDurations);

    return (
      <div styleName="words-by-durations">
        <div styleName="words-by-durations__top">
          <Navigation />
          <CreateWordsByDuration />
        </div>
        <div styleName="words-by-durations__active">
          <h2 styleName="words-by-durations__title">
            Active Words By Durations
          </h2>
          <ul styleName="words-by-durations__list words-by-durations__list--active">
            {isSuccess &&
              wordsByDurations.active.map((wordsByDuration: any) => {
                return (
                  <li styleName="words-by-durations__words-by-duration words-by-duration">
                    <ul styleName="words-by-duration__words">
                      {wordsByDuration.words.map(({ word }: any) => {
                        return (
                          <li styleName="words-by-duration__word">{word}</li>
                        );
                      })}
                    </ul>
                  </li>
                );
              })}
          </ul>
          {!isPending && !wordsByDurations.active.length && (
            <NoMore
              title={"No more active words by durations"}
              description={
                "Add more active words by duration see more in your collection"
              }
            />
          )}
        </div>
        <div styleName="words-by-durations__inactive">
          <h2 styleName="words-by-durations__title">
            Inactive Words By Durations
          </h2>
          <ul styleName="words-by-durations__list words-by-durations__list--inactive">
            {isSuccess &&
              wordsByDurations.inactive.map((wordsByDuration: any) => {
                return (
                  <li styleName="words-by-durations__words-by-duration words-by-duration">
                    <ul styleName="words-by-duration__words">
                      {wordsByDuration.words.map(({ word }: any) => {
                        return (
                          <li styleName="words-by-duration__word">{word}</li>
                        );
                      })}
                    </ul>
                  </li>
                );
              })}
          </ul>
          {!isPending && !wordsByDurations.inactive.length && (
            <NoMore
              title={"No more inactive words by durations"}
              description={
                "Add more inactive words by duration see more in your collection"
              }
            />
          )}
        </div>
      </div>
    );
  },
  styles,
  { allowMultiple: true, handleNotFoundStyleName: "ignore" }
);

export default WordsByDurations;
