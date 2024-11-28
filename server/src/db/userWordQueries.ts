import { QueryResult } from "pg";

import { Queries } from "./queries";
import { UserQueries } from "./userQueries";
import { WordQueries } from "./wordQueries";

export interface UserWord {
  id: string;
  word_id: string;
  user_id: string;
  learned: boolean;
  created_at: Date;
  updated_at: Date;
}

interface Page {
  page: number;
  limit: number;
}

interface Result {
  userWords: UserWord[];
  previous?: Page;
  next?: Page;
}

export class UserWordQueries extends Queries<UserWord> {
  userQueries: UserQueries;
  wordQueries: WordQueries;

  constructor() {
    super(["*"], "user_words");
    this.userQueries = new UserQueries();
    this.wordQueries = new WordQueries();
  }

  async create({
    userId,
    wordId,
    learned,
  }: {
    userId: string;
    wordId: string;
    learned: boolean;
  }): Promise<UserWord> {
    const existingUserWord = await this.get({ userId, wordId });

    if (existingUserWord) {
      return existingUserWord;
    }

    const { rows }: QueryResult<UserWord> = await this.pool.query(
      `
    INSERT INTO user_words(user_id, word_id, learned)
    VALUES ($1, $2, $3)
    RETURNING *;
      `,
      [userId, wordId, learned]
    );

    return rows[0];
  }

  async setLearned({
    userId,
    wordId,
    learned,
  }: {
    userId: string;
    wordId: string;
    learned: boolean;
  }): Promise<void> {
    await this.pool.query(
      `
    UPDATE user_words
    SET learned = $1
    WHERE user_id = $2
    AND word_id = $3;
      `,
      [learned, userId, wordId]
    );
  }

  async get({
    userId,
    wordId,
  }: {
    userId: string;
    wordId: string;
  }): Promise<UserWord | undefined> {
    const { rows }: QueryResult<UserWord> = await this.pool.query(
      `
    SELECT * FROM user_words
    WHERE user_id = $1
    AND word_id = $2;
      `,
      [userId, wordId]
    );

    return rows[0];
  }

  async delete({
    userId,
    wordId,
  }: {
    userId: string;
    wordId: string;
  }): Promise<UserWord> {
    const { rows }: QueryResult<UserWord> = await this.pool.query(
      `
    DELETE FROM user_words
    WHERE user_id = $1
    AND word_id = $2
    RETURNING *;
      `,
      [userId, wordId]
    );

    return rows[0];
  }

  async deleteAllByUserId(userId: string): Promise<UserWord[]> {
    const { rows }: QueryResult<UserWord> = await this.pool.query(
      `
    DELETE FROM user_words
    WHERE user_id = $1
    RETURNING *;
      `,
      [userId]
    );

    return rows;
  }

  async getByUserId(
    userId: string,
    options: {
      learned?: boolean;
      search?: string;
      // direction refers to whether the column should be sorted in ascending (1) or descending (-1) order
      sort?: { table: string; direction: number; column: string };
      page?: number;
      limit?: number;
    } = {}
  ): Promise<Result> {
    const queryParts = [
      `
    SELECT words.*, user_words.*
    FROM user_words
      `,
      `
    JOIN words
    ON user_words.word_id = words.id
      `,
      `
    WHERE user_id = $1
      `,
    ];
    const queryParams: unknown[] = [userId];
    let paramIndex = 1;

    if (typeof options.learned === "boolean") {
      queryParts.push(`AND user_words.learned = $${++paramIndex}`);
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

    const sortClauses: string[] = [];
    if (options.sort) {
      const sortClause = options.sort;
      sortClauses.push(
        `${sortClause.table}.${sortClause.column} ${
          sortClause.direction === 1 ? "ASC" : "DESC"
        }`
      );
    }
    if (sortClauses.length > 0) {
      queryParts.push(`ORDER BY ${sortClauses.join(", ")}`);
    }

    const page: number = options.page || 1;
    const limit: number = options.limit || 8;
    const startIndex = (page - 1) * limit;
    const { rows: preLimitRows }: QueryResult<UserWord> = await this.pool.query(
      queryParts.join(" "),
      queryParams
    );
    // calculate the length of the rows before applying a limit on it to see how many rows match the query
    const totalRows = Number(preLimitRows.length);
    if (options.page && options.limit) {
      queryParts.push(`LIMIT $${++paramIndex} OFFSET $${++paramIndex}`);
      queryParams.push(options.limit, startIndex);
    }

    const query: string = queryParts.join(" ");
    const { rows }: QueryResult<UserWord> = await this.pool.query(
      query,
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
  }
}
