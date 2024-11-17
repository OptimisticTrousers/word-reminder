import { Pool } from "pg";

import { variables } from "../utils/variables";

export const pool = new Pool({
  connectionString:
    variables.NODE_ENV === "test"
      ? variables.TEST_DATABASE_URL
      : variables.DATABASE_URL,
});
