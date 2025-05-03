import express from "express";
import request from "supertest";
import { Client } from "pg";

import { variables } from "../config/variables";
import { reset_database } from "../controllers/testing_controller";
import * as db from "../db";
import { boss } from "../db/boss";

const { TEST_DATABASE_URL } = variables;

jest.mock("pg", () => {
  const originalModule = jest.requireActual("pg");
  return {
    ...originalModule,
    Client: jest.fn().mockImplementation(),
  };
});

const app = express();
app.use(express.json());
app.delete("/api/testing/reset", reset_database);

describe("reset_database", () => {
  it("calls the functions to clear the database", async () => {
    const mockClear = jest.fn();
    const mockInitializeConnection = jest.fn();
    const mockPopulate = jest.fn();
    const mockStopConnection = jest.fn();
    const mockCreatePopulateDb = jest
      .spyOn(db, "createPopulateDb")
      .mockImplementation(() => {
        const originalModule = jest.requireActual("../db");
        return {
          clear: mockClear,
          initializeConnection: mockInitializeConnection,
          stopConnection: mockStopConnection,
          populate: mockPopulate,
          ...originalModule,
        };
      });
    const mockClearStorage = jest
      .spyOn(boss, "clearStorage")
      .mockImplementation(jest.fn());
    const mockStop = jest.spyOn(boss, "stop").mockImplementation(jest.fn());
    const mockStart= jest.spyOn(boss, "start").mockImplementation(jest.fn());

    const response = await request(app)
      .delete("/api/testing/reset")
      .set("Accept", "application/json");

    expect(response.status).toBe(204);
    expect(response.body).toEqual({});
    expect(mockCreatePopulateDb).toHaveBeenCalledTimes(1);
    expect(mockCreatePopulateDb.mock.calls[0][0] instanceof Client).toBe(true);
    expect(Client).toHaveBeenCalledTimes(1);
    expect(Client).toHaveBeenCalledWith({
      connectionString: TEST_DATABASE_URL,
    });
    expect(mockInitializeConnection).toHaveBeenCalledTimes(1);
    expect(mockInitializeConnection).toHaveBeenCalledWith();
    expect(mockClear).toHaveBeenCalledTimes(1);
    expect(mockClear).toHaveBeenCalledWith();
    expect(mockPopulate).toHaveBeenCalledTimes(1);
    expect(mockPopulate).toHaveBeenCalledWith();
    expect(mockStopConnection).toHaveBeenCalledTimes(1);
    expect(mockStopConnection).toHaveBeenCalledWith();
    expect(mockClearStorage).toHaveBeenCalledTimes(1);
    expect(mockClearStorage).toHaveBeenCalledWith();
    expect(mockStop).toHaveBeenCalledTimes(1);
    expect(mockStop).toHaveBeenCalledWith({
      close: false,
      graceful: false,
      wait: false,
    });
    expect(mockStart).toHaveBeenCalledTimes(1);
    expect(mockClearStorage).toHaveBeenCalledWith();
  });
});
