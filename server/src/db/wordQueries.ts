import { QueryResult } from "pg";

import { Queries } from "./queries";

export interface Word {
  meanings: Meaning[];
  phonetics: Phonetic[];
  phonetic?: string;
  word: string;
  origin?: string;
  license?: License;
  sourceUrls?: string[];
}

export interface WordWithId extends Word {
  id: string;
  created_at: Date;
}
interface Phonetic {
  text?: string;
  audio?: string;
}

interface Meaning {
  partOfSpeech: string;
  definitions: Definition[];
}

interface MeaningWithId extends Meaning {
  id: string;
}

interface Definition {
  definition: string;
  example?: string;
  synonyms?: string[];
  antonyms?: string[];
}

interface PhoneticWithId extends Meaning {
  id: string;
}

interface License {
  name: string;
  url: string;
}

type DefinitionId = Definition & { meaningId: string };

type MeaningId = Meaning & { wordId: string };

type PhoneticId = Phonetic & { wordId: string };

export class WordQueries extends Queries {
  async createWord(json: Word[]): Promise<WordWithId> {
    const word: string = json[0].word;
    const origin: string | undefined = json[0].origin;
    const phonetic: string | undefined = json[0].phonetic;
    const meanings: Meaning[] = json[0].meanings;
    const phonetics: Phonetic[] = json[0].phonetics;
    const { rows }: QueryResult<WordWithId> = await this.pool.query(
      "INSERT INTO words(word, origin, phonetic) VALUES ($1, $2, $3) RETURNING *",
      [word, origin, phonetic]
    );

    const newWord: WordWithId = rows[0];

    for (let i = 0; i < meanings.length; i++) {
      const meaning: Meaning = meanings[i];

      await this.createMeaning({ wordId: newWord.id, ...meaning });
    }

    for (let i = 0; i < phonetics.length; i++) {
      const phonetic: Phonetic = phonetics[i];

      await this.createPhonetic({
        wordId: newWord.id,
        ...phonetic,
      });
    }

    return newWord;
  }

  async wordExistsByWord(word: string): Promise<boolean> {
    const existingWord: WordWithId | undefined = await this.getWordByWord(word);

    if (existingWord) {
      return true;
    }

    return false;
  }

  async wordExistsById(id: string): Promise<boolean> {
    const existingWord: WordWithId | undefined = await this.getWordById(id);

    if (existingWord) {
      return true;
    }

    return false;
  }

  async getWordByWord(word: string): Promise<WordWithId | undefined> {
    const { rows }: QueryResult<WordWithId> = await this.pool.query(
      "SELECT * FROM words WHERE word = $1",
      [word.toLowerCase()]
    );

    const existingWord: WordWithId | undefined = rows[0];

    return existingWord;
  }

  async getWordById(id: string): Promise<WordWithId | undefined> {
    const { rows }: QueryResult<WordWithId> = await this.pool.query(
      "SELECT * FROM words WHERE id = $1",
      [id]
    );

    const word: WordWithId | undefined = rows[0];

    return word;
  }

  private async createMeaning({
    wordId,
    definitions,
    partOfSpeech,
  }: MeaningId): Promise<void> {
    const { rows }: QueryResult<MeaningWithId> = await this.pool.query(
      "INSERT INTO meanings(part_of_speech, word_id) VALUES ($1, $2) RETURNING *",
      [partOfSpeech, wordId]
    );

    const meaning: MeaningWithId = rows[0];

    for (let i = 0; i < definitions.length; i++) {
      const definition: Definition = definitions[i];

      await this.createDefinition({ meaningId: meaning.id, ...definition });
    }
  }

  private async createDefinition({
    meaningId,
    definition,
    example,
    synonyms,
    antonyms,
  }: DefinitionId): Promise<MeaningWithId> {
    const { rows }: QueryResult<MeaningWithId> = await this.pool.query(
      "INSERT INTO definitions(meaning_id, definition, example, synonyms, antonyms) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [meaningId, definition, example, synonyms, antonyms]
    );

    const meaning: MeaningWithId = rows[0];

    return meaning;
  }

  private async createPhonetic({
    audio,
    text,
    wordId,
  }: PhoneticId): Promise<PhoneticWithId> {
    const { rows }: QueryResult<PhoneticWithId> = await this.pool.query(
      "INSERT INTO phonetics(audio, text, word_id) VALUES ($1, $2, $3) RETURNING *",
      [audio, text, wordId]
    );

    const phonetic: PhoneticWithId = rows[0];

    return phonetic;
  }
}
