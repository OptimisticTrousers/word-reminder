import { QueryResult } from "pg";

import { Queries } from "./queries";

export interface Word {
  id: string;
  details: Json;
  created_at: Date;
}

type Json = {
  phonetic?: string;
  phonetics: Phonetic[];
  meanings: Meaning[];
  word: string;
  origin?: string;
  license?: License;
  sourceUrls?: string[];
}[];

interface Phonetic {
  text?: string;
  audio?: string;
  sourceUrl?: string;
  license?: License;
}

interface Meaning {
  partOfSpeech: string;
  definitions: Definition[];
}

interface Definition {
  definition: string;
  example?: string;
  synonyms?: string[];
  antonyms?: string[];
}

interface License {
  name: string;
  url: string;
}

export class WordQueries extends Queries<Word> {
  constructor() {
    super(["*"], "words");
  }

  async create(json: Json): Promise<Word> {
    const existingWord = await this.getByWord(json[0].word);

    if (existingWord) {
      return existingWord;
    }

    const { rows }: QueryResult<Word> = await this.pool.query(
      `
    INSERT INTO words(details)
    VALUES ($1)
    RETURNING *;
      `,
      [JSON.stringify(json)]
    );

    return rows[0];
  }

  async getByWord(word: string): Promise<Word | undefined> {
    const { rows }: QueryResult<Word> = await this.pool.query(
      `
    SELECT *
    FROM words
    WHERE
      EXISTS (
        SELECT 1
        FROM jsonb_array_elements(details) AS detail
        WHERE detail->>'word' = LOWER($1)
      );
      `,
      [word]
    );

    return rows[0];
  }
}
