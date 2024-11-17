import { Queries } from "./queries";
import { UserQueries } from "./userQueries";
import { WordQueries } from "./wordQueries";

export class UserWordQueries extends Queries {
  userQueries: UserQueries;
  wordQueries: WordQueries;

  constructor() {
    super();
    this.userQueries = new UserQueries();
    this.wordQueries = new WordQueries();
  }

  private async verifyIds(userId: string, wordId: string) {
    const userExists = await this.userQueries.userExistsById(userId);

    if (!userExists) {
      return { message: `User with ID ${userId} does not exist.` };
    }

    const wordExists = await this.wordQueries.wordExistsById(wordId);

    if (!wordExists) {
      return { message: `Word with ID ${wordId} does not exist.` };
    }

    return { message: "" };
  }

  async createUserWord(userId: string, wordId: string) {
    const verification = await this.verifyIds(userId, wordId);

    if (verification.message) return verification;

    const { rows } = await this.pool.query(
      "INSERT INTO user_words(user_id, word_id) VALUES ($1, $2) RETURNING *",
      [userId, wordId]
    );

    const userWord = rows[0];

    return userWord;
  }

  async deleteUserWord(userId: string, wordId: string) {
    const verification = await this.verifyIds(userId, wordId);

    if (verification.message) return verification;

    const { rows } = await this.pool.query(
      "DELETE FROM user_words WHERE user_id = $1 AND word_id = $2",
      [wordId, userId]
    );

    const userWord = rows[0];

    return userWord;
  }

  async deleteAllUserWords(userId: string) {
    const { rows } = await this.pool.query(
      "DELETE FROM user_words WHERE user_id = $1 RETURNING *",
      [userId]
    );

    return rows;
  }

  async getUserWordsByUserId(userId: string) {
    const { rows } = await this.pool.query(
      "SELECT * FROM user_words WHERE user_id = $1",
      [userId]
    );

    return rows;
  }

  async existsUserWordsByUserId(userId: string) {
    const userWords = await this.getUserWordsByUserId(userId);
    if (userWords.length) {
      return true;
    }
    return false;
  }
}
