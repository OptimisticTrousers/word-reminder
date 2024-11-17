import { Pool } from "pg";

import { pool } from "./pool";

export class Queries {
  pool: Pool;

  constructor() {
    this.pool = pool;
  }
}
