import { QueryResult } from "pg";

import { Queries } from "./queries";
import { UserQueries } from "./userQueries";
import { WordQueries } from "./wordQueries";

  id: string;
  word_id: string;
  user_id: string;
  learned: boolean;
  created_at: Date;
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
    const { rows }: QueryResult<UserWord> = await this.pool.query(
    );

    const userWord: UserWord = rows[0];

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
