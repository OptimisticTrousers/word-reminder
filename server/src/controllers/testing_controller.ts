import asyncHandler from "express-async-handler";
import { Client } from "pg";

import { variables } from "../config/variables";
import { createPopulateDb } from "../db";

const { TEST_DATABASE_URL } = variables;

export const reset_database = asyncHandler(async (_req, res) => {
  const database = createPopulateDb(
    new Client({ connectionString: TEST_DATABASE_URL })
  );

  await database.initializeConnection();

  await database.clear();

  await database.populate();

  await database.stopConnection();

  res.status(204).end();
});
