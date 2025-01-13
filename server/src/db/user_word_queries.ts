import { QueryResult } from "pg";

import { createQueries } from "./queries";

interface Page {
  page: number;
  limit: number;
}

interface RandomOptions {
  count: number;
  learned: boolean;
  order: Order;
}

export enum Order {
  Newest,
  Oldest,
  Random,
}

export interface Result {
  userWords: UserWord[];
  previous?: Page;
  next?: Page;
}

export interface UserWord {
  id: string;
  word_id: string;
  user_id: string;
  learned: boolean;
  created_at: Date;
  updated_at: Date;
}

export const userWordQueries = (function () {
  const queries = createQueries<UserWord>(["*"], "user_words");
  const { columns, db, getById, table } = queries;

  const create = async ({
    user_id,
    word_id,
    learned,
  }: {
    user_id: string;
    word_id: string;
    learned: boolean;
  }): Promise<UserWord> => {
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

  const remove = async ({
    user_id,
    word_id,
  }: {
    user_id: string;
    word_id: string;
  }): Promise<UserWord> => {
    const { rows }: QueryResult<UserWord> = await db.query(
      `
    DELETE FROM ${table}
    WHERE user_id = $1
    AND word_id = $2
    RETURNING ${columns};
      `,
      [user_id, word_id]
    );

    return rows[0];
  };

  const deleteAllByUserId = async (user_id: string): Promise<UserWord[]> => {
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
    user_id: string;
    word_id: string;
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

  const getUserWords = async (
    user_id: string,
    options: RandomOptions
  ): Promise<UserWord[]> => {
    let orderClause = "";
    switch (options.order) {
      case Order.Oldest:
        orderClause = "created_at ASC";
        break;
      case Order.Newest:
        orderClause = "created_at DESC";
        break;
      case Order.Random:
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
      [user_id, options.learned, options.count]
    );

    return rows;
  };

  const getByUserId = async (
    user_id: string,
    options: {
      learned?: boolean;
      search?: string;
      // direction refers to whether the column should be sorted in ascending (1) or descending (-1) order
      sort?: { table: string; direction: number; column: string };
      page?: number;
      limit?: number;
    } = {}
  ): Promise<Result> => {
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

    let result: Result = { userWords: rows };

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

  const setLearned = async ({
    user_id,
    word_id,
    learned,
  }: {
    user_id: string;
    word_id: string;
    learned: boolean;
  }): Promise<UserWord> => {
    const { rows }: QueryResult<UserWord> = await db.query(
      `
    UPDATE ${table}
    SET learned = $1
    WHERE user_id = $2
    AND word_id = $3
    RETURNING ${columns};
      `,
      [learned, user_id, word_id]
    );

    return rows[0];
  };

  return {
    create,
    delete: remove,
    deleteAllByUserId,
    get,
    getById: getById.bind(queries),
    getUserWords,
    getByUserId,
    setLearned,
  };
})();
