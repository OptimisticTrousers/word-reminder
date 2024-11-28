import { QueryResult } from "pg";

import { Queries } from "./queries";

export interface User {
  id: string;
  username: string;
  created_at: Date;
  updated_at: Date;
}

export class UserQueries extends Queries<User> {
  constructor() {
    super(["id", "username", "created_at", "updated_at"], "users");
  }

  async create({
    username,
    password,
  }: {
    username: string;
    password: string;
  }): Promise<User | null> {
    const existingUser = await this.getByUsername(username);

    if (existingUser) {
      return null;
    }

    const { rows }: QueryResult<User> = await this.pool.query(
      `
    INSERT INTO users(username, password)
    VALUES ($1, $2)
    RETURNING id, username, created_at, updated_at;
      `,
      [username, password]
    );

    return rows[0];
  }

  async deleteById(id: string): Promise<User> {
    const { rows } = await this.pool.query(
      `
    DELETE
    FROM users
    WHERE id = $1
    RETURNING id, username, created_at, updated_at;
      `,
      [id]
    );

    return rows[0];
  }

  async getByUsername(username: string): Promise<User | undefined> {
    const { rows }: QueryResult<User> = await this.pool.query(
      `
    SELECT id, username, created_at, updated_at
    FROM users
    WHERE username = $1;
      `,
      [username]
    );

    return rows[0];
  }
}
