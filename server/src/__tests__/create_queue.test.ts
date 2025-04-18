import express from "express";
import request from "supertest";

import { boss } from "../db/boss";
import { createQueue } from "../middleware/create_queue";

const userId = 1;
const queuePostfix = "emails-queue";

describe("createQueue", () => {
  it("creates a queue for word reminders", async () => {
    const app = express();
    app.use(express.json());
    app.post(
      "/api/users/:userId/emails",
      createQueue(queuePostfix),
      (req, res) => {
        res.status(200).json({ queueName: res.locals.queueName });
      }
    );
    const mockCreateQueue = jest
      .spyOn(boss, "createQueue")
      .mockImplementation(jest.fn());

    const response = await request(app)
      .post(`/api/users/${userId}/emails`)
      .set("Accept", "application/json");

    const queueName = `${userId}-${queuePostfix}`;
    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ queueName });
    expect(mockCreateQueue).toHaveBeenCalledTimes(1);
    expect(mockCreateQueue).toHaveBeenCalledWith(queueName);
  });
});
