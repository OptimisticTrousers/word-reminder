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

export class UserWordQueries extends Queries {
  userQueries: UserQueries;
  wordQueries: WordQueries;

  constructor() {
    super();
    this.userQueries = new UserQueries();
    this.wordQueries = new WordQueries();
  }

  async createUserWord(
    userId: string,
    wordId: string,
    learned: boolean = false
  ): Promise<UserWord | null> {
    const { rows }: QueryResult<UserWord> = await this.pool.query(
      "INSERT INTO user_words(user_id, word_id, learned) VALUES ($1, $2, $3) RETURNING *",
      [userId, wordId, learned]
    );

    const userWord: UserWord = rows[0];

    return userWord;
  }

  async setLearnedUserWord(
    userId: string,
    wordId: string,
    learned: boolean
  ): Promise<void> {
    await this.pool.query(
      "UPDATE user_words SET learned = $1 WHERE user_id = $2 AND word_id = $3",
      [learned, userId, wordId]
    );
  }

  async getUserWord(userId: string, wordId: string): Promise<UserWord | null> {
    const { rows }: QueryResult<UserWord> = await this.pool.query(
      "SELECT * FROM user_words WHERE user_id = $1 AND word_id = $2",
      [userId, wordId]
    );

    const userWord: UserWord = rows[0];

    return userWord;
  }

  async userWordExists(userId: string, wordId: string): Promise<boolean> {
    const userWord: UserWord | null = await this.getUserWord(userId, wordId);

    if (userWord) {
      return true;
    }

    return false;
  }

  async deleteUserWord(
    userId: string,
    wordId: string
  ): Promise<UserWord | null> {
    const { rows }: QueryResult<UserWord> = await this.pool.query(
      "DELETE FROM user_words WHERE user_id = $1 AND word_id = $2",
      [userId, wordId]
    );

    const userWord: UserWord = rows[0];

    return userWord;
  }

  async deleteAllUserWords(userId: string): Promise<UserWord[]> {
    const { rows }: QueryResult<UserWord> = await this.pool.query(
      "DELETE FROM user_words WHERE user_id = $1 RETURNING *",
      [userId]
    );

    return rows;
  }

  async getUserWordsByUserId(
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
      "SELECT words.*, user_words.* FROM user_words",
      "JOIN words ON user_words.word_id = words.id",
      "WHERE user_id = $1",
    ];
    const queryParams: unknown[] = [userId];
    let paramIndex = 1;

    if (typeof options.learned === "boolean") {
      queryParts.push(`AND user_words.learned = $${++paramIndex}`);
      queryParams.push(options.learned);
    }

    if (options.search) {
      queryParts.push(`AND words.word ILIKE $${++paramIndex}`);
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

  async existsUserWordsByUserId(userId: string): Promise<boolean> {
    const result: Result = await this.getUserWordsByUserId(userId);

    if (result.userWords.length) {
      return true;
    }
    return false;
  }
}
