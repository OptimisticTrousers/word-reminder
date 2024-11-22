import { QueryResult } from "pg";

import { Queries } from "./queries";

interface User {
  id: string;
  username: string;
  password?: string;
  created_at: Date;
}

export type OmitPassword = Omit<User, "password">;

export class UserQueries extends Queries {
  async createUser(username: string, password: string): Promise<User | null> {
    const doesUserExist: boolean = await this.userExistsByUsername(username);
    if (doesUserExist) {
      return null;
    }

    const { rows }: QueryResult<User> = await this.pool.query(
      "INSERT INTO users(username, password) VALUES ($1, $2) RETURNING *",
      [username, password]
    );

    const user: User = rows[0];

    if (user) {
      delete user.password;
    }

    return user;
  }

  async userExistsByUsername(username: string): Promise<boolean> {
    const user: User = await this.getUserByUsername(username);
    if (user) {
      return true;
    }
    return false;
  }

  async userExistsById(id: string): Promise<boolean> {
    const user: User = await this.getUserById(id);
    if (user) {
      return true;
    }
    return false;
  }

  async deleteUserById(id: string): Promise<void> {
    await this.pool.query("DELETE FROM users WHERE id = $1", [id]);
  }

  async getUserById(id: string): Promise<User> {
    const { rows }: QueryResult<User> = await this.pool.query(
      "SELECT * FROM users WHERE id = $1",
      [id]
    );

    const user: User = rows[0];

    if (user) {
      delete user.password;
    }

    return user;
  }

  async getUserByUsername(username: string): Promise<User> {
    const { rows }: QueryResult<User> = await this.pool.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );

    const user: User = rows[0];

    if (user) {
      delete user.password;
    }

    return user;
  }
}
