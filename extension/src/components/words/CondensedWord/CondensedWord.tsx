/* eslint-disable @typescript-eslint/no-explicit-any */
import CSSModules from "react-css-modules";
import styles from "./Word.module.css";
import { Play } from "lucide-react";
import { UserWord as IUserWord, Word as IWord } from "common";

export const CondensedWord= CSSModules(
  function ({details}: IUserWord & IWord) {

    return (
      <div styleName="word">
        <div styleName="word__top">
          <div styleName="word__title">
            <h2 styleName="word__text">{details}</h2>
            <p styleName="word__phonetic">{phonetic}</p>
          </div>
          <button styleName="word__button">
            <Play styleName="word__icon" />
          </button>
        </div>
        <div styleName="word__container">
          <div styleName="word__block">
            <h3 styleName="word__subtitle">Origin</h3>
            <p styleName="word__description">{origin}</p>
          </div>
          {meanings.map((meaning: any) => (
            <div styleName="word__meanings" key={meaning}>
              <span styleName="word__part-of-speech">
                {meaning.partOfSpeech} <hr styleName="word__line" />
              </span>
              <div styleName="word__block">
                <h3 styleName="word__subtitle">Meanings</h3>
                <ul styleName="word__definitions">
                  {meaning.definitions.map(({ definition }: any) => (
                    <li styleName="word__definition" key={definition}>
                      {definition}
                    </li>
                  ))}
                </ul>
              </div>
              <div styleName="word__block">
                <h3 styleName="word__subtitle">Synonyms</h3>
                <ul styleName="word__definitions">
                  {meaning.definitions.map((definition: any) =>
                    definition.synonyms.map((synonym: any) => (
                      <li styleName="word__definition" key={definition}>
                        {synonym}
                      </li>
                    ))
                  )}
                </ul>
              </div>
              <div styleName="word__block">
                <h3 styleName="word__subtitle">Antonyms</h3>
                <ul styleName="word__definitions">
                  {meaning.definitions.map((definition: any) =>
                    definition.antonyms.map((antonym: any) => (
                      <li styleName="word__definition" key={antonym}>
                        {antonym}
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  },
  styles,
  { allowMultiple: true, handleNotFoundStyleName: "log" }
);
