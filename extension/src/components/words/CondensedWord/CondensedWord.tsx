import { Definition, Detail, Meaning, Phonetic } from "common";
import CSSModules from "react-css-modules";
import { Play } from "lucide-react";

import styles from "./CondensedWord.module.css";

export const CondensedWord = CSSModules(
  function ({ details }: { details: Detail[] }) {
    function handleAudio(url: string) {
      const audio = new Audio(url);
      audio.play();
    }

    return (
      <div styleName="word">
        {details.map((detail: Detail) => {
          return (
            <>
              <div styleName="word__top">
                <div styleName="word__title">
                  {detail.phonetic && (
                    <p styleName="word__phonetic">{detail.phonetic}</p>
                  )}
                  <ul styleName="word__phonetics">
                    {detail.phonetics &&
                      detail.phonetics.map((phonetic: Phonetic) => {
                        return (
                          <li styleName="word__phonetic">
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
                          </li>
                        );
                      })}
                  </ul>
                </div>
              </div>
              <div styleName="word__container">
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
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </>
          );
        })}
      </div>
    );
  },
  styles,
  { allowMultiple: true, handleNotFoundStyleName: "log" }
);
