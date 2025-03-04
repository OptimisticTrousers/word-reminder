import { Client } from "pg";

import { createPopulateDb, db } from "./";
import { variables } from "../config/variables";
import { boss } from "./boss";

const { TEST_DATABASE_URL } = variables;

const populateDb = createPopulateDb(
  new Client({ connectionString: TEST_DATABASE_URL })
);

// Standard database setup and teardown. Do not clear between each test, as state is often required to persist between tests
beforeAll(async () => {
  await boss.stop();
  await populateDb.initializeConnection();
});

beforeEach(async () => {
  await populateDb.clear();
  await populateDb.populate();
});

afterAll(async () => {
  await populateDb.stopConnection(); // stops client connections
  await db.stopConnection(); // stops pool connection in app for integration tests
});
