import { Pool, QueryResult } from "pg";

import { pool } from "./pool";

export class Queries<T> {
  private columns: string[];
  private table: string;
  pool: Pool;

  constructor(columns: string[], table: string) {
    this.columns = columns;
    this.table = table;
    this.pool = pool;
  }

  async getById(id: string): Promise<T | undefined> {
    const { rows }: QueryResult = await this.pool.query(
      `
    SELECT ${this.columns.join(", ")}
    FROM ${this.table}
    WHERE id = $1
      `,
      [id]
    );

    return rows[0];
  }
}
