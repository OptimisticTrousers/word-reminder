import { Page, SortMode, UserWord } from "common";
import { QueryResult } from "pg";

import { createQueries } from "./queries";

export interface Result {
  userWords: UserWord[];
  previous?: Page;
  next?: Page;
  totalRows: number;
}

export const userWordQueries = (function () {
  const queries = createQueries<UserWord>(["*"], "user_words");
  const { columns, db, deleteById, getById, table } = queries;

  const create = async ({
    user_id,
    word_id,
    learned,
  }: {
    user_id: number;
    word_id: number;
    learned: boolean;
  }) => {
    const existingUserWord = await get({ user_id, word_id });

    if (existingUserWord) {
      return existingUserWord;
    }

    const { rows }: QueryResult<UserWord> = await db.query(
      `
    INSERT INTO ${table}(user_id, word_id, learned)
    VALUES ($1, $2, $3)
    RETURNING ${columns};
      `,
      [user_id, word_id, learned]
    );

    return rows[0];
  };

  const deleteByUserId = async (user_id: number) => {
    const { rows }: QueryResult<UserWord> = await db.query(
      `
    DELETE FROM ${table}
    WHERE user_id = $1
    RETURNING ${columns};
      `,
      [user_id]
    );

    return rows;
  };

  const get = async ({
    user_id,
    word_id,
  }: {
    user_id: number;
    word_id: number;
  }): Promise<UserWord | undefined> => {
    const { rows }: QueryResult<UserWord> = await db.query(
      `
    SELECT ${columns} 
    FROM ${table}
    WHERE user_id = $1
    AND word_id = $2;
      `,
      [user_id, word_id]
    );

    return rows[0];
  };

  const getByUserId = async (
    user_id: number,
    options: {
      learned?: boolean;
      search?: string;
      // direction refers to whether the column should be sorted in ascending (1) or descending (-1) order
      sort?: { table: string; direction: number; column: string };
      page?: number;
      limit?: number;
    } = {}
  ) => {
    const queryParts = [
      `
    SELECT words.*, ${table}.*
    FROM ${table}
      `,
      `
    JOIN words
    ON ${table}.word_id = words.id
      `,
      `
    WHERE user_id = $1
      `,
    ];
    const queryParams: unknown[] = [user_id];
    let paramIndex = 1;

    if (typeof options.learned === "boolean") {
      queryParts.push(`AND ${table}.learned = $${++paramIndex}`);
      queryParams.push(options.learned);
    }

    if (options.search) {
      queryParts.push(
        `
      AND EXISTS (
        SELECT 1
        FROM jsonb_array_elements(words.details) AS detail
        WHERE detail->>'word' ILIKE $${++paramIndex}
      )
        `
      );
      queryParams.push(`%${options.search}%`);
    }

    if (options.sort) {
      const sortClause = options.sort;
      queryParts.push(
        `ORDER BY ${sortClause.table}.${sortClause.column} ${
          sortClause.direction === 1 ? "ASC" : "DESC"
        }`
      );
    }

    const page: number = options.page || 1;
    const limit: number = options.limit || 8;
    const startIndex = (page - 1) * limit;

    const { rows: preLimitRows }: QueryResult<UserWord> = await db.query(
      queryParts.join(" "),
      queryParams
    );
    const totalRows = preLimitRows.length;

    if (options.page && options.limit) {
      queryParts.push(`LIMIT $${++paramIndex} OFFSET $${++paramIndex}`);
      queryParams.push(options.limit, startIndex);
    }

    const { rows }: QueryResult<UserWord> = await db.query(
      queryParts.join(" "),
      queryParams
    );

    const result: Result = { userWords: rows, totalRows };

    if (startIndex > 0) {
      result.previous = {
        page: page - 1,
        limit,
      };
    }

    const endIndex = page * limit;
    if (endIndex < totalRows) {
      result.next = {
        page: page + 1,
        limit,
      };
    }

    return result;
  };

  const getUserWords = async ({
    user_id,
    word_count,
    has_learned_words,
    sort_mode,
  }: {
    user_id: number;
    word_count: number;
    has_learned_words: boolean;
    sort_mode: SortMode;
  }) => {
    let orderClause = "";

    switch (sort_mode) {
      case SortMode.Oldest:
        orderClause = "created_at ASC";
        break;
      case SortMode.Newest:
        orderClause = "created_at DESC";
        break;
      case SortMode.Random:
        orderClause = "RANDOM()";
        break;
    }

    const { rows }: QueryResult<UserWord> = await db.query(
      `
    SELECT ${columns}
    FROM ${table}
    WHERE user_id = $1 AND learned = $2
    ORDER BY ${orderClause}
    LIMIT $3;
      `,
      [user_id, has_learned_words, word_count]
    );

    return rows;
  };

  const setLearned = async (
    id: number,
    {
      learned,
    }: {
      learned: boolean;
    }
  ) => {
    const { rows }: QueryResult<UserWord> = await db.query(
      `
    UPDATE ${table}
    SET learned = $2
    WHERE id = $1
    RETURNING ${columns};
      `,
      [id, learned]
    );

    return rows[0];
  };

  return {
    create,
    deleteByUserId,
    get,
    getById: getById.bind(queries),
    deleteById: deleteById.bind(queries),
    getByUserId,
    getUserWords,
    setLearned,
  };
})();
