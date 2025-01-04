import PgBoss from "pg-boss";

import { variables } from "../config/variables";
import { Scheduler } from "../utils/scheduler";

jest.mock("pg-boss");

const mockStart = jest.fn();
const mockCreateQueue = jest.fn();
const mockSendAfter = jest.fn();
const mockWork = jest.fn();
const mockOn = jest.fn();
const mockStop = jest.fn();

const PgBossMock = PgBoss as unknown as jest.Mock;
PgBossMock.mockImplementation(() => ({
  start: mockStart,
  createQueue: mockCreateQueue,
  sendAfter: mockSendAfter,
  work: mockWork,
  on: mockOn,
  stop: mockStop,
}));

describe("Scheduler", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("constructor", () => {
    it("calls the function to call constructor and on error handler", () => {
      new Scheduler();

      expect(PgBossMock).toHaveBeenCalledTimes(1);
      expect(PgBossMock).toHaveBeenCalledWith(variables.TEST_DATABASE_URL);
      expect(mockOn).toHaveBeenCalledTimes(1);
      expect(mockOn).toHaveBeenCalledWith("error", console.error);
    });
  });

  describe("start", () => {
    it("calls the function to start", async () => {
      const boss = new Scheduler();
      await boss.start();

      expect(mockStart).toHaveBeenCalledTimes(1);
      expect(mockStart).toHaveBeenCalledWith();
    });
  });

  describe("createQueue", () => {
    it("calls the functions to create a queue", async () => {
      const queueName = "queue";
      const scheduler = new Scheduler();
      await scheduler.createQueue(queueName);

      expect(mockCreateQueue).toHaveBeenCalledTimes(1);
      expect(mockCreateQueue).toHaveBeenCalledWith(queueName);
    });
  });

  describe("sendAfter", () => {
    it("calls the functions to add a job to a queue at a specific date", async () => {
      const scheduler = new Scheduler();
      const date = new Date();
      const queueName = "test-queue";
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

  describe("work", () => {
    it("calls the function to run jobs in a queue", async () => {
      const scheduler = new Scheduler();
      const handler = jest.fn();

      await scheduler.work("test-queue", handler);

      expect(mockWork).toHaveBeenCalledTimes(1);
      expect(mockWork).toHaveBeenCalledWith("test-queue", handler);
    });
  });

  describe("stop", () => {
    it("calls the function to run jobs in a queue", async () => {
      const scheduler = new Scheduler();
      const options = {
        close: true,
        graceful: false,
        timeout: 30000,
        wait: false,
      };

      await scheduler.stop(options);

      expect(mockStop).toHaveBeenCalledTimes(1);
      expect(mockStop).toHaveBeenCalledWith(options);
    });
  });
});
