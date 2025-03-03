import express from "express";
import request from "supertest";
import { boss } from "../db/boss";
import { createQueue } from "../middleware/create_queue";

describe("createQueue", () => {
  const userId = "1";
  const message = "Success.";
  const queueName = "word-reminder-queue";

  it("creates a queue for word reminders", async () => {
    const app = express();
    app.use(express.json());
    app.use((req, res, next) => {
      req.user = { id: userId };
      next();
    });
    app.post(
      "/wordReminders",
      createQueue("word-reminder-queue"),
      (req, res, next) => {
        res.status(200).json({ message });
      }
    );
    const mockCreateQueue = jest
      .spyOn(boss, "createQueue")
      .mockImplementation(jest.fn());

    const response = await request(app)
      .post("/wordReminders")
      .set("Accept", "application/json");

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message });
    expect(mockCreateQueue).toHaveBeenCalledTimes(1);
    expect(mockCreateQueue).toHaveBeenCalledWith(`${userId}-${queueName}`);
  });
});
