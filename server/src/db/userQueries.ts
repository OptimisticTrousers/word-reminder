import { QueryResult } from "pg";

import { Queries } from "./queries";

export interface User {
  id: string;
  email: string;
  created_at: Date;
  updated_at: Date;
}

export class UserQueries extends Queries<User> {
  constructor() {
    super(["id", "email", "created_at", "updated_at"], "users");
  }

  async create({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<User | null> {
    const existingUser = await this.getByEmail(email);

    if (existingUser) {
      return null;
    }

    const { rows }: QueryResult<User> = await this.pool.query(
      `
    INSERT INTO ${this.table}(email, password)
    VALUES ($1, $2)
    RETURNING ${this.columns};
      `,
      [email, password]
    );

    return rows[0];
  }

  async deleteById(id: string): Promise<User> {
    const { rows } = await this.pool.query(
      `
    DELETE
    FROM ${this.table}
    WHERE id = $1
    RETURNING ${this.columns};
      `,
      [id]
    );

    return rows[0];
  }

  async getByEmail(email: string): Promise<User | undefined> {
    const { rows }: QueryResult<User> = await this.pool.query(
      `
    SELECT ${this.columns}
    FROM users
    WHERE email= $1;
      `,
      [email]
    );

    return rows[0];
  }
}
