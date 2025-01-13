import { Pool } from "pg";

import { variables } from "../config/variables";

const { DATABASE_URL, NODE_ENV, TEST_DATABASE_URL } = variables;

jest.mock("pg");

describe("db", () => {
  const originalEnv = NODE_ENV;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    // Restore the original NODE_ENV after all tests
    variables.NODE_ENV = originalEnv;
  });

  describe("constructor", () => {
    it("uses DATABASE_URL when NODE_ENV is not 'test'", async () => {
      process.env.NODE_ENV = "production";
      await jest.isolateModulesAsync(async () => {
        await import("../db/index");
      });
      expect(Pool).toHaveBeenCalledTimes(1);
      expect(Pool).toHaveBeenCalledWith({ connectionString: DATABASE_URL });
    });

    it("uses TEST_DATABASE_URL when NODE_ENV is 'test'", async () => {
      process.env.NODE_ENV = "test";
      await jest.isolateModulesAsync(async () => {
        await import("../db/index");
      });
      expect(Pool).toHaveBeenCalledTimes(1);
      expect(Pool).toHaveBeenCalledWith({
        connectionString: TEST_DATABASE_URL,
      });
    });
  });
});
