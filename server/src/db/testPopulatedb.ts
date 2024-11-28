import { Database } from "./database";
import { pool } from "./pool";
import { variables } from "../config/variables";

const database = new Database(variables.TEST_DATABASE_URL);

// Standard database setup and teardown. Do not clear between each test, as state is often required to persist between tests
beforeAll(async () => {
  await database.initializeConnection();
});

beforeEach(async () => {
  await database.clear();
  await database.populate();
});

afterAll(async () => {
  await database.stopConnection();
  await pool.end();
});
