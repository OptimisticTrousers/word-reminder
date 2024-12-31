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

export interface Result {
  userWords: UserWord[];
  previous?: Page;
  next?: Page;
}

export enum Order {
  Newest,
  Oldest,
  Random,
}

interface Page {
  page: number;
  limit: number;
}

interface RandomOptions {
  count: number;
  learned: boolean;
  order: Order;
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
    user_id,
    word_id,
    learned,
  }: {
    user_id: string;
    word_id: string;
    learned: boolean;
  }): Promise<UserWord> {
    const existingUserWord = await this.get({ user_id, word_id });

    if (existingUserWord) {
      return existingUserWord;
    }

    const { rows }: QueryResult<UserWord> = await this.pool.query(
      `
    INSERT INTO ${this.table}(user_id, word_id, learned)
    VALUES ($1, $2, $3)
    RETURNING ${this.columns};
      `,
      [user_id, word_id, learned]
    );

    return rows[0];
  }

  async setLearned({
    user_id,
    word_id,
    learned,
  }: {
    user_id: string;
    word_id: string;
    learned: boolean;
  }): Promise<UserWord> {
    const { rows }: QueryResult<UserWord> = await this.pool.query(
      `
    UPDATE ${this.table}
    SET learned = $1
    WHERE user_id = $2
    AND word_id = $3
    RETURNING ${this.columns};
      `,
      [learned, user_id, word_id]
    );

    return rows[0];
  }

  async get({
    user_id,
    word_id,
  }: {
    user_id: string;
    word_id: string;
  }): Promise<UserWord | undefined> {
    const { rows }: QueryResult<UserWord> = await this.pool.query(
      `
    SELECT ${this.columns} 
    FROM ${this.table}
    WHERE user_id = $1
    AND word_id = $2;
      `,
      [user_id, word_id]
    );

    return rows[0];
  }

  async getUserWords(
    user_id: string,
    options: RandomOptions
  ): Promise<UserWord[]> {
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

    const { rows }: QueryResult<UserWord> = await this.pool.query(
      `
    SELECT ${this.columns}
    FROM ${this.table}
    WHERE user_id = $1 AND learned = $2
    ORDER BY ${orderClause}
    LIMIT $3;
      `,
      [user_id, options.learned, options.count]
    );

    return rows;
  }

  async delete({
    user_id,
    word_id,
  }: {
    user_id: string;
    word_id: string;
  }): Promise<UserWord> {
    const { rows }: QueryResult<UserWord> = await this.pool.query(
      `
    DELETE FROM ${this.table}
    WHERE user_id = $1
    AND word_id = $2
    RETURNING ${this.columns};
      `,
      [user_id, word_id]
    );

    return rows[0];
  }

  async deleteAllByUserId(user_id: string): Promise<UserWord[]> {
    const { rows }: QueryResult<UserWord> = await this.pool.query(
      `
    DELETE FROM ${this.table}
    WHERE user_id = $1
    RETURNING ${this.columns};
      `,
      [user_id]
    );

    return rows;
  }

  async getByUserId(
    user_id: string,
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
    SELECT words.*, ${this.table}.*
    FROM ${this.table}
      `,
      `
    JOIN words
    ON ${this.table}.word_id = words.id
      `,
      `
    WHERE user_id = $1
      `,
    ];
    const queryParams: unknown[] = [user_id];
    let paramIndex = 1;

    if (typeof options.learned === "boolean") {
      queryParts.push(`AND ${this.table}.learned = $${++paramIndex}`);
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

    const { rows: preLimitRows }: QueryResult<UserWord> = await this.pool.query(
      queryParts.join(" "),
      queryParams
    );
    const totalRows = preLimitRows.length;

    if (options.page && options.limit) {
      queryParts.push(`LIMIT $${++paramIndex} OFFSET $${++paramIndex}`);
      queryParams.push(options.limit, startIndex);
    }

    const { rows }: QueryResult<UserWord> = await this.pool.query(
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
  }
}
