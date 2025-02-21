import { QueryResult } from "pg";

import { createQueries } from "./queries";
import { Detail, Word } from "common";

export const wordQueries = (function () {
  const queries = createQueries<Word>(["*"], "words");
  const { columns, db, getById, table } = queries;

  const create = async ({ json }: { json: Detail[] }): Promise<Word> => {
    const existingWord = await getByWord(json[0].word);

    if (existingWord) {
      return existingWord;
    }

    const { rows }: QueryResult<Word> = await db.query(
      `
    INSERT INTO ${table}(details)
    VALUES ($1)
    RETURNING ${columns};
      `,
      [JSON.stringify(json)]
    );

    return rows[0];
  };

  const getByWord = async (word: string): Promise<Word | undefined> => {
    const { rows }: QueryResult<Word> = await db.query(
      `
    SELECT ${columns}
    FROM ${table}
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
  };

  return { create, getById: getById.bind(queries), getByWord };
})();
