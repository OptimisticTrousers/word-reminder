import {
  Definition,
  Detail,
  Meaning,
  Phonetic,
  User,
  UserWord as IUserWord,
  Word,
  Image,
} from "common";
import { Play } from "lucide-react";
import CSSModules from "react-css-modules";
import { Link, useOutletContext, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { Loading } from "../../components/ui/Loading";
import { Error500 } from "../Error500";
import { userWordService } from "../../services/user_word_service";
import styles from "./UserWord.module.css";
import { ImageCarousel } from "../../components/ui/ImageCarousel";

export const UserWord = CSSModules(
  function () {
    const { user }: { user: User } = useOutletContext();
    const { userWordId } = useParams();
    const userId = String(user.id);

    const { data, isLoading, failureReason } = useQuery({
      queryKey: ["userWords", userWordId],
      queryFn: () => {
        return userWordService.getUserWord({
          userId,
          userWordId: String(userWordId),
        });
      },
    });

    if (failureReason) {
      return <Error500 message={failureReason.message} />;
    }

    if (isLoading) {
      return <Loading />;
    }

    function handleAudio(url: string) {
      const audio = new Audio(url);
      audio.play();
    }

    const json = data?.json;
    const userWord: (IUserWord & { word: Word; images: Image[] }) | undefined =
      json?.userWord;
    const details = userWord?.word.details;
    const images = userWord?.images ?? [];

    return (
      details && (
        <div styleName="word">
          {<h2 styleName="word__heading">{details[0].word}</h2>}
          {
            <p styleName="word__learned">
              {userWord.learned ? "Learned word" : "Word not learned"}
            </p>
          }
          {
            <p styleName="word__created_at">
              {userWord.created_at.toLocaleString()}
            </p>
          }
          {
            <ImageCarousel
              images={images}
              hasAutoScroll={images.length > 0 ? true : false}
            />
          }
          {details.map((detail: Detail, index: number) => {
            return (
              <div key={index} styleName="word_content">
                <div styleName="word__top">
                  <div styleName="word__title">
                    {detail.phonetic && (
                      <p styleName="word__phonetic">{detail.phonetic}</p>
                    )}
                    <ul styleName="word__phonetics">
                      {detail.phonetics &&
                        detail.phonetics.map(
                          (phonetic: Phonetic, index: number) => {
                            return (
                              <li key={index} styleName="word__phonetic">
                                {phonetic.text && (
                                  <p styleName="word__text">{phonetic.text}</p>
                                )}
                                {phonetic.audio && (
                                  <button
                                    styleName="word__button"
                                    onClick={() => handleAudio(phonetic.audio!)}
                                  >
                                    <span styleName="word__text">
                                      Pronounce word
                                    </span>
                                    <Play styleName="word__icon" />
                                  </button>
                                )}
                                {phonetic.sourceUrl && (
                                  <Link
                                    to={phonetic.sourceUrl}
                                    styleName="word__link"
                                  >
                                    Phonetic Source
                                  </Link>
                                )}
                                {phonetic.license && (
                                  <div styleName="word__license">
                                    <p styleName="word__name">
                                      {phonetic.license.name}
                                    </p>
                                    <Link
                                      to={phonetic.license.url}
                                      styleName="word__url"
                                    >
                                      Phonetic License
                                    </Link>
                                  </div>
                                )}
                              </li>
                            );
                          }
                        )}
                    </ul>
                  </div>
                </div>
                <div styleName="word__container">
                  <div styleName="word__block">
                    <h3 styleName="word__subtitle">Origin</h3>
                    <p styleName="word__description">{detail.origin}</p>
                  </div>
                  {detail.meanings.map((meaning: Meaning, index: number) => (
                    <div styleName="word__meanings" key={index}>
                      <span styleName="word__part-of-speech">
                        {meaning.partOfSpeech} <hr styleName="word__line" />
                      </span>
                      <div styleName="word__block">
                        <h3 styleName="word__subtitle">Meanings</h3>
                        <ul styleName="word__definitions">
                          {meaning.definitions.map(
                            (definition: Definition, index: number) => (
                              <li styleName="word__definition" key={index}>
                                <p styleName="word__definition">
                                  {definition.definition}
                                </p>
                                {definition.example && (
                                  <p styleName="word__example">
                                    {definition.example}
                                  </p>
                                )}
                                {definition.synonyms &&
                                  definition.synonyms.map(
                                    (synonym: string, index: number) => {
                                      return (
                                        <li
                                          styleName="word__synonym"
                                          key={index}
                                        >
                                          {synonym}
                                        </li>
                                      );
                                    }
                                  )}
                                {definition.antonyms &&
                                  definition.antonyms.map(
                                    (antonym: string, index: number) => {
                                      return (
                                        <li
                                          styleName="word__antonym"
                                          key={index}
                                        >
                                          {antonym}
                                        </li>
                                      );
                                    }
                                  )}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                      {meaning.synonyms && (
                        <div styleName="word__block">
                          <h3 styleName="word__subtitle">Synonyms</h3>
                          <ul styleName="word__definitions">
                            {meaning.synonyms.map(
                              (synonym: string, index: number) => {
                                return (
                                  <li styleName="word__synonym" key={index}>
                                    {synonym}
                                  </li>
                                );
                              }
                            )}
                          </ul>
                        </div>
                      )}
                      {meaning.antonyms && (
                        <div styleName="word__block">
                          <h3 styleName="word__subtitle">Antonyms</h3>
                          <ul styleName="word__definitions">
                            {meaning.antonyms.map(
                              (antonym: string, index: number) => {
                                return (
                                  <li styleName="word__antonym" key={index}>
                                    {antonym}
                                  </li>
                                );
                              }
                            )}
                          </ul>
                        </div>
                      )}
                      {detail.license && (
                        <div styleName="word__license">
                          <p styleName="word__name">{detail.license.name}</p>
                          <Link to={detail.license.url} styleName="word__url">
                            Word License
                          </Link>
                        </div>
                      )}
                      <ul styleName="word__list">
                        {detail.sourceUrls &&
                          detail.sourceUrls.map(
                            (sourceUrl: string, index: number) => {
                              return (
                                <li key={index} styleName="word__item">
                                  <Link to={sourceUrl} styleName="word__link">
                                    Word Source
                                  </Link>
                                </li>
                              );
                            }
                          )}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )
    );
  },
  styles,
  { allowMultiple: true, handleNotFoundStyleName: "log" }
);
