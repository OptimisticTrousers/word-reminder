import { QueryResult } from "pg";

import { Queries } from "./queries";
import { UserQueries } from "./userQueries";
import { WordQueries } from "./wordQueries";

type Verification = { userWord: UserWord | null; message: string } | null;

interface UserWord {
  id: string;
  word_id: string;
  user_id: string;
  learned: boolean;
  created_at: Date;
}

export type UserQueryResult = Verification | { userWord: UserWord; message: string };

export class UserWordQueries extends Queries {
  userQueries: UserQueries;
  wordQueries: WordQueries;

  constructor() {
    super();
    this.userQueries = new UserQueries();
    this.wordQueries = new WordQueries();
  }

  private async verifyIds(
    userId: string,
    wordId: string
  ): Promise<Verification> {
    const userExists: boolean = await this.userQueries.userExistsById(userId);

    if (!userExists) {
      return {
        userWord: null,
        message: `User with ID ${userId} does not exist.`,
      };
    }

    const wordExists: boolean = await this.wordQueries.wordExistsById(wordId);

    if (!wordExists) {
      return {
        userWord: null,
        message: `Word with ID ${wordId} does not exist.`,
      };
    }

    return null;
  }

  async createUserWord(
    userId: string,
    wordId: string
  ): Promise<UserQueryResult> {
    const verification: Verification = await this.verifyIds(userId, wordId);

    if (verification) return verification;

    const existingUserWord: boolean = await this.userWordExists(userId, wordId);

    if (existingUserWord) {
      return {
        userWord: null,
        message: "You have already added this word in your dictionary.",
      };
    }

    const { rows }: QueryResult<UserWord> = await this.pool.query(
      "INSERT INTO user_words(user_id, word_id) VALUES ($1, $2) RETURNING *",
      [userId, wordId]
    );

    const userWord: UserWord = rows[0];

    return { userWord, message: "Success!" };
  }

  async getUserWord(userId: string, wordId: string): Promise<UserQueryResult> {
    const verification: Verification = await this.verifyIds(userId, wordId);

    if (verification) return verification;

    const { rows }: QueryResult<UserWord> = await this.pool.query(
      "SELECT * FROM user_words WHERE user_id = $1 AND word_id = $2",
      [userId, wordId]
    );

    const userWord: UserWord = rows[0];

    return { userWord, message: "Success!" };
  }

  async userWordExists(userId: string, wordId: string): Promise<boolean> {
    const result: UserQueryResult = await this.getUserWord(userId, wordId);

    if (result && result.userWord) {
      return true;
    }

    return false;
  }

  async deleteUserWord(
    userId: string,
    wordId: string
  ): Promise<UserQueryResult> {
    const verification: Verification = await this.verifyIds(userId, wordId);

    if (verification) return verification;

    const { rows }: QueryResult<UserWord> = await this.pool.query(
      "DELETE FROM user_words WHERE user_id = $1 AND word_id = $2",
      [userId, wordId]
    );

    const userWord: UserWord = rows[0];

    return { userWord, message: "Success!" };
  }

  async deleteAllUserWords(userId: string): Promise<UserWord[]> {
    const { rows }: QueryResult<UserWord> = await this.pool.query(
      "DELETE FROM user_words WHERE user_id = $1 RETURNING *",
      [userId]
    );

    return rows;
  }

  async getUserWordsByUserId(userId: string): Promise<UserWord[]> {
    const { rows }: QueryResult<UserWord> = await this.pool.query(
      "SELECT * FROM user_words WHERE user_id = $1",
      [userId]
    );

    return rows;
  }

  async existsUserWordsByUserId(userId: string): Promise<boolean> {
    const userWords: UserWord[] = await this.getUserWordsByUserId(userId);

    if (userWords.length) {
      return true;
    }
    return false;
  }
}
