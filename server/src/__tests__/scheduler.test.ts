import PgBoss from "pg-boss";

import { variables } from "../config/variables";

const { DATABASE_URL, NODE_ENV, TEST_DATABASE_URL } = variables;

const mockStart = jest.fn();
const mockCreateQueue = jest.fn();
const mockSendAfter = jest.fn();
const mockWork = jest.fn();
const mockOn = jest.fn();
const mockStop = jest.fn();

jest.mock("pg-boss", () => {
  return jest.fn().mockImplementation(() => {
    return {
      start: mockStart,
      createQueue: mockCreateQueue,
      sendAfter: mockSendAfter,
      work: mockWork,
      on: mockOn,
      stop: mockStop,
    };
  });
});

describe("Scheduler", () => {
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
        await import("../utils/scheduler");
      });
      expect(PgBoss).toHaveBeenCalledTimes(1);
      expect(PgBoss).toHaveBeenCalledWith(DATABASE_URL);
      expect(mockOn).toHaveBeenCalledTimes(1);
      expect(mockOn).toHaveBeenCalledWith("error", console.error);
    });

    it("uses TEST_DATABASE_URL when NODE_ENV is 'test'", async () => {
      process.env.NODE_ENV = "test";
      await jest.isolateModulesAsync(async () => {
        await import("../utils/scheduler");
      });
      expect(PgBoss).toHaveBeenCalledTimes(1);
      expect(PgBoss).toHaveBeenCalledWith(TEST_DATABASE_URL);
      expect(mockOn).toHaveBeenCalledTimes(1);
      expect(mockOn).toHaveBeenCalledWith("error", console.error);
    });
  });

  describe("createQueue", () => {
    it("calls the functions to create a queue", async () => {
      const queueName = "queue";
      const { scheduler } = await import("../utils/scheduler");
      await scheduler.createQueue(queueName);

      expect(mockCreateQueue).toHaveBeenCalledTimes(1);
      expect(mockCreateQueue).toHaveBeenCalledWith(queueName);
    });
  });

  describe("sendAfter", () => {
    it("calls the functions to add a job to a queue at a specific date", async () => {
      const date = new Date();
      const queueName = "test-queue";
      const { scheduler } = await import("../utils/scheduler");
      await scheduler.createQueue("test-queue");
      await scheduler.sendAfter(queueName, { arg1: "value" }, date);

      expect(mockSendAfter).toHaveBeenCalledTimes(1);
      expect(mockSendAfter).toHaveBeenCalledWith(
        queueName,
        { arg1: "value" },
        { retryLimit: 3 },
        date
      );
    });
  });

  describe("start", () => {
    it("calls the function to start", async () => {
      const { scheduler } = await import("../utils/scheduler");
      await scheduler.start();
      expect(mockStart).toHaveBeenCalledTimes(1);
      expect(mockStart).toHaveBeenCalledWith();
    });
  });

  describe("stop", () => {
    it("calls the function to run jobs in a queue", async () => {
      const options = {
        close: true,
        graceful: false,
        timeout: 30000,
        wait: false,
      };

      const { scheduler } = await import("../utils/scheduler");
      await scheduler.stop(options);

      expect(mockStop).toHaveBeenCalledTimes(1);
      expect(mockStop).toHaveBeenCalledWith(options);
    });
  });

  describe("work", () => {
    it("calls the function to run jobs in a queue", async () => {
      const handler = jest.fn();

      const { scheduler } = await import("../utils/scheduler");
      await scheduler.work("test-queue", handler);

      expect(mockWork).toHaveBeenCalledTimes(1);
      expect(mockWork).toHaveBeenCalledWith("test-queue", handler);
    });
  });
});
