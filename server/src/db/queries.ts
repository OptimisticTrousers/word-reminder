import { Db, db } from "./index";

interface Queries<T> {
  columns: string;
  table: string;
  db: Db;
  getById: (id: string) => Promise<T | undefined>;
  deleteById: (id: string) => Promise<T | undefined>;
}

const queriesProto = {
  columns: "",
  table: "",
  db,
  async getById<T>(this: Queries<T>, id: string): Promise<T | undefined> {
    const { rows } = await this.db.query(
      `
    SELECT ${this.columns}
    FROM ${this.table}
    WHERE id = $1;
      `,
      [id]
    );

    return rows[0];
  },

  async deleteById<T>(this: Queries<T>, id: string): Promise<T | undefined> {
    const { rows } = await this.db.query(
      `
    DELETE FROM ${this.table}
    WHERE id = $1
    RETURNING ${this.columns};
      `,
      [id]
    );

    return rows[0];
  },
};

export const createQueries = <T>(
  columns: string[],
  table: string
): Queries<T> => {
  return Object.assign(Object.create(queriesProto), {
    columns: columns.join(", "),
    table,
  });
};
