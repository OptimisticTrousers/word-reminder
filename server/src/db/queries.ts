import { Pool, QueryResult } from "pg";

import { pool } from "./pool";

export class Queries<T> {
  protected columns: string;
  protected table: string;
  protected pool: Pool;

  constructor(columns: string[], table: string) {
    this.columns = columns.join(", ");
    this.table = table;
    this.pool = pool;
  }

  async getById(id: string): Promise<T | undefined> {
    const { rows }: QueryResult = await this.pool.query(
      `
    SELECT ${this.columns}
    FROM ${this.table}
    WHERE id = $1
      `,
      [id]
    );

    return rows[0];
  }
}
