import { QueryResult } from "pg";

import { Queries } from "./queries";

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

export type Json = {
  phonetic?: string;
  phonetics: Phonetic[];
  meanings: Meaning[];
  word: string;
  origin?: string;
  license?: License;
  sourceUrls?: string[];
}[];

export interface Word {
  id: string;
  details: Json;
  created_at: Date;
}

export class WordQueries extends Queries<Word> {
  constructor() {
    super(["*"], "words");
  }

  async create({ json }: { json: Json }): Promise<Word> {
    const existingWord = await this.getByWord(json[0].word);

    if (existingWord) {
      return existingWord;
    }

    const { rows }: QueryResult<Word> = await this.pool.query(
      `
    INSERT INTO ${this.table}(details)
    VALUES ($1)
    RETURNING ${this.columns};
      `,
      [JSON.stringify(json)]
    );

    return rows[0];
  }

  async getByWord(word: string): Promise<Word | undefined> {
    const { rows }: QueryResult<Word> = await this.pool.query(
      `
    SELECT ${this.columns}
    FROM ${this.table}
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
