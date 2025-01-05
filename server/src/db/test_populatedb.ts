import { variables } from "../config/variables";
import { Database } from "./database";
import { pool } from "./pool";
import { scheduler } from "../utils/scheduler";

const database = new Database(variables.TEST_DATABASE_URL);

// Standard database setup and teardown. Do not clear between each test, as state is often required to persist between tests
beforeAll(async () => {
  await database.initializeConnection();
  await scheduler.start();
});

beforeEach(async () => {
  await database.clear();
  await database.populate();
});

afterAll(async () => {
  await scheduler.stop({
    close: true,
    graceful: true,
    timeout: 25000,
    wait: true,
  });
  await database.stopConnection();
  await pool.end();
});
