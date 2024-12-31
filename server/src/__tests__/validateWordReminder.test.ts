import asyncHandler from "express-async-handler";
import express from "express";
import request from "supertest";

import { errorValidationHandler } from "../middleware/errorValidationHandler";
import { validateWordReminder } from "../middleware/validateWordReminder";
import { Order } from "../db/userWordQueries";

describe("validateWordReminder", () => {
  const message = "Success!";
  const userWord1 = {
    id: 1,
    word_id: 1,
    user_id: 1,
    learned: false,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const userWord2 = {
    id: 2,
    word_id: 2,
    user_id: 1,
    learned: false,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const userWord3 = {
    id: 3,
    word_id: 3,
    user_id: 1,
    learned: false,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const app = express();
  app.use(express.json());
  app.post(
    "/api/users/:userId/wordReminders",
    validateWordReminder,
    errorValidationHandler,
    asyncHandler(async (req, res, next) => {
      res.status(200).json({ message });
    })
  );

  describe("auto", () => {
    it("returns 400 status code when 'auto' is not provided", async () => {
      const body = {
        auto: undefined,
        finish: new Date(),
        words: [userWord1, userWord2, userWord3],
        isActive: false,
        hasReminderOnload: false,
        reminder: "every hour",
      };

      const response = await request(app)
        .post("/api/users/:userId/wordReminders")
        .set("Accept", "application/json")
        .send(body);

      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        errors: [
          {
            location: "body",
            msg: "'auto' must be specified.",
            path: "auto",
            type: "field",
          },
        ],
      });
    });

    it("returns 400 status code when 'auto' is a not a boolean", async () => {
      const body = {
        auto: "string",
        finish: new Date(),
        words: [userWord1, userWord2, userWord3],
        isActive: false,
        hasReminderOnload: false,
        reminder: "every hour",
      };

      const response = await request(app)
        .post("/api/users/:userId/wordReminders")
        .set("Accept", "application/json")
        .send(body);

      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        errors: [
          {
            location: "body",
            msg: "'auto' must be a boolean.",
            path: "auto",
            type: "field",
            value: "string",
          },
        ],
      });
    });
  });

  describe("isActive", () => {
    it("returns 400 status code when 'isActive' is not provided", async () => {
      const body = {
        finish: new Date(),
        auto: false,
        words: [userWord1, userWord2, userWord3],
        isActive: undefined,
        hasReminderOnload: false,
        reminder: "every hour",
      };

      const response = await request(app)
        .post("/api/users/:userId/wordReminders")
        .set("Accept", "application/json")
        .send(body);

      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        errors: [
          {
            location: "body",
            msg: "'isActive' must be specified.",
            path: "isActive",
            type: "field",
          },
        ],
      });
    });

    it("returns 400 status code when 'isActive' is not a boolean", async () => {
      const body = {
        finish: new Date(),
        auto: false,
        words: [userWord1, userWord2, userWord3],
        isActive: "string",
        hasReminderOnload: false,
        reminder: "every hour",
      };

      const response = await request(app)
        .post("/api/users/:userId/wordReminders")
        .set("Accept", "application/json")
        .send(body);

      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        errors: [
          {
            location: "body",
            msg: "'isActive' must be a boolean.",
            path: "isActive",
            type: "field",
            value: "string",
          },
        ],
      });
    });
  });

  describe("hasReminderOnLoad", () => {
    it("returns 400 status code when 'hasReminderOnload' is not provided", async () => {
      const body = {
        finish: new Date(),
        auto: false,
        words: [userWord1, userWord2, userWord3],
        isActive: false,
        hasReminderOnload: undefined,
        reminder: "every hour",
      };
      const response = await request(app)
        .post("/api/users/:userId/wordReminders")
        .set("Accept", "application/json")
        .send(body);
      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        errors: [
          {
            location: "body",
            msg: "'hasReminderOnload' must be specified.",
            path: "hasReminderOnload",
            type: "field",
          },
        ],
      });
    });

    it("returns 400 status code when 'hasReminderOnload' is not a boolean", async () => {
      const body = {
        finish: new Date(),
        auto: false,
        words: [userWord1, userWord2, userWord3],
        isActive: false,
        hasReminderOnload: "string",
        reminder: "every hour",
      };

      const response = await request(app)
        .post("/api/users/:userId/wordReminders")
        .set("Accept", "application/json")
        .send(body);

      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        errors: [
          {
            location: "body",
            msg: "'hasReminderOnload' must be a boolean.",
            path: "hasReminderOnload",
            type: "field",
            value: "string",
          },
        ],
      });
    });
  });

  describe("reminder", () => {
    it("returns 400 status code when 'reminder' is not provided", async () => {
      const body = {
        finish: new Date(),
        auto: false,
        words: [userWord1, userWord2, userWord3],
        isActive: false,
        hasReminderOnload: false,
        reminder: undefined,
      };

      const response = await request(app)
        .post("/api/users/:userId/wordReminders")
        .set("Accept", "application/json")
        .send(body);

      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        errors: [
          {
            location: "body",
            msg: "'reminder' must be specified.",
            path: "reminder",
            type: "field",
          },
        ],
      });
    });
  });

  describe("validateManualWordReminder", () => {
    describe("finish", () => {
      it("returns 400 status code when 'finish' is not provided", async () => {
        const body = {
          finish: undefined,
          auto: false,
          words: [userWord1, userWord2, userWord3],
          isActive: false,
          hasReminderOnload: false,
          reminder: "every hour",
        };

        const response = await request(app)
          .post("/api/users/:userId/wordReminders")
          .set("Accept", "application/json")
          .send(body);

        expect(response.headers["content-type"]).toMatch(/json/);
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          errors: [
            {
              location: "body",
              msg: "'finish' must be specified.",
              path: "finish",
              type: "field",
            },
          ],
        });
      });

      it("returns 400 status code when 'finish' is not a date", async () => {
        const body = {
          finish: "string",
          auto: false,
          words: [userWord1, userWord2, userWord3],
          isActive: false,
          hasReminderOnload: false,
          reminder: "every hour",
        };

        const response = await request(app)
          .post("/api/users/:userId/wordReminders")
          .set("Accept", "application/json")
          .send(body);

        expect(response.headers["content-type"]).toMatch(/json/);
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          errors: [
            {
              location: "body",
              msg: "'finish' must be a date.",
              path: "finish",
              type: "field",
              value: "string",
            },
          ],
        });
      });

      it("returns 400 status code when 'finish' is before the current date", async () => {
        const finish = new Date(1);
        const body = {
          finish,
          auto: false,
          words: [userWord1, userWord2, userWord3],
          isActive: false,
          hasReminderOnload: false,
          reminder: "every hour",
        };

        const response = await request(app)
          .post("/api/users/:userId/wordReminders")
          .set("Accept", "application/json")
          .send(body);

        expect(response.headers["content-type"]).toMatch(/json/);
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          errors: [
            {
              location: "body",
              msg: "'finish' must come after the current date.",
              path: "finish",
              type: "field",
              value: finish.toISOString(),
            },
          ],
        });
      });
    });

    describe("words", () => {
      it("returns 400 status code when 'words' is not provided", async () => {
        const body = {
          finish: new Date(),
          auto: false,
          words: undefined,
          isActive: false,
          hasReminderOnload: false,
          reminder: "every hour",
        };

        const response = await request(app)
          .post("/api/users/:userId/wordReminders")
          .set("Accept", "application/json")
          .send(body);

        expect(response.headers["content-type"]).toMatch(/json/);
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          errors: [
            {
              location: "body",
              msg: "'words' must be specified.",
              path: "words",
              type: "field",
            },
          ],
        });
      });

      it("returns 400 status code when 'words' is not an array", async () => {
        const body = {
          finish: new Date(),
          auto: false,
          words: "string",
          isActive: false,
          hasReminderOnload: false,
          reminder: "every hour",
        };

        const response = await request(app)
          .post("/api/users/:userId/wordReminders")
          .set("Accept", "application/json")
          .send(body);

        expect(response.headers["content-type"]).toMatch(/json/);
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          errors: [
            {
              location: "body",
              msg: "'words' must be an array.",
              path: "words",
              type: "field",
              value: "string",
            },
          ],
        });
      });
    });
  });

  describe("validateAutoWordReminder", () => {
    describe("wordCount", () => {
      it("returns 400 status code when 'wordCount' is not provided", async () => {
        const body = {
          auto: true,
          wordCount: undefined,
          isActive: false,
          hasReminderOnload: false,
          reminder: "every hour",
          duration: 7 * 24 * 60, // 1 week in minutes
          hasLearnedWords: false,
          order: Order.Random,
        };

        const response = await request(app)
          .post("/api/users/:userId/wordReminders")
          .set("Accept", "application/json")
          .send(body);

        expect(response.headers["content-type"]).toMatch(/json/);
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          errors: [
            {
              location: "body",
              msg: "'wordCount' must be specified.",
              path: "wordCount",
              type: "field",
            },
          ],
        });
      });

      it("returns 400 status code when 'wordCount' is not a number", async () => {
        const body = {
          auto: true,
          wordCount: "string",
          isActive: false,
          hasReminderOnload: false,
          reminder: "every hour",
          duration: 7 * 24 * 60, // 1 week in minutes
          hasLearnedWords: false,
          order: Order.Random,
        };

        const response = await request(app)
          .post("/api/users/:userId/wordReminders")
          .set("Accept", "application/json")
          .send(body);

        expect(response.headers["content-type"]).toMatch(/json/);
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          errors: [
            {
              location: "body",
              msg: "'wordCount' must be a positive integer.",
              path: "wordCount",
              type: "field",
              value: "string",
            },
          ],
        });
      });
    });

    describe("duration", () => {
      it("returns 400 status code when 'duration' is not provided", async () => {
        const body = {
          auto: true,
          wordCount: 7,
          isActive: false,
          hasReminderOnload: false,
          reminder: "every hour",
          duration: undefined,
          hasLearnedWords: false,
          order: Order.Random,
        };

        const response = await request(app)
          .post("/api/users/:userId/wordReminders")
          .set("Accept", "application/json")
          .send(body);

        expect(response.headers["content-type"]).toMatch(/json/);
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          errors: [
            {
              location: "body",
              msg: "'duration' must be specified.",
              path: "duration",
              type: "field",
            },
          ],
        });
      });

      it("returns 400 status code when 'duration' is not a positive integer", async () => {
        const body = {
          auto: true,
          wordCount: 7,
          isActive: false,
          hasReminderOnload: false,
          reminder: "every hour",
          duration: -1,
          hasLearnedWords: false,
          order: Order.Random,
        };

        const response = await request(app)
          .post("/api/users/:userId/wordReminders")
          .set("Accept", "application/json")
          .send(body);

        expect(response.headers["content-type"]).toMatch(/json/);
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          errors: [
            {
              location: "body",
              msg: "'duration' must be a positive integer.",
              path: "duration",
              type: "field",
              value: -1,
            },
          ],
        });
      });
    });

    describe("hasLearnedWords", () => {
      it("returns 400 status code when 'hasLearnedWords' is not provided", async () => {
        const body = {
          auto: true,
          wordCount: 7,
          isActive: false,
          hasReminderOnload: false,
          reminder: "every hour",
          duration: 7 * 24 * 60, // 1 week in minutes
          hasLearnedWords: undefined,
          order: Order.Random,
        };

        const response = await request(app)
          .post("/api/users/:userId/wordReminders")
          .set("Accept", "application/json")
          .send(body);

        expect(response.headers["content-type"]).toMatch(/json/);
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          errors: [
            {
              location: "body",
              msg: "'hasLearnedWords' must be specified.",
              path: "hasLearnedWords",
              type: "field",
            },
          ],
        });
      });

      it("returns 400 status code when 'hasLearnedWords' is not a boolean", async () => {
        const body = {
          auto: true,
          wordCount: 7,
          isActive: false,
          hasReminderOnload: false,
          reminder: "every hour",
          duration: 7 * 24 * 60, // 1 week in minutes
          hasLearnedWords: "string",
          order: Order.Random,
        };

        const response = await request(app)
          .post("/api/users/:userId/wordReminders")
          .set("Accept", "application/json")
          .send(body);

        expect(response.headers["content-type"]).toMatch(/json/);
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          errors: [
            {
              location: "body",
              msg: "'hasLearnedWords' must be a boolean.",
              path: "hasLearnedWords",
              type: "field",
              value: "string",
            },
          ],
        });
      });
    });

    describe("order", () => {
      it("returns 400 status code when 'order' is not provided", async () => {
        const body = {
          auto: true,
          wordCount: 7,
          isActive: false,
          hasReminderOnload: false,
          reminder: "every hour",
          duration: 7 * 24 * 60, // 1 week in minutes
          hasLearnedWords: true,
          order: undefined,
        };

        const response = await request(app)
          .post("/api/users/:userId/wordReminders")
          .set("Accept", "application/json")
          .send(body);

        expect(response.headers["content-type"]).toMatch(/json/);
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          errors: [
            {
              location: "body",
              msg: "'order' must be specified.",
              path: "order",
              type: "field",
            },
          ],
        });
      });

      it("returns 400 status code when 'order' is not one of the 'Order' enum values", async () => {
        const body = {
          auto: true,
          wordCount: 7,
          isActive: false,
          hasReminderOnload: false,
          reminder: "every hour",
          duration: 7 * 24 * 60, // 1 week in minutes
          hasLearnedWords: false,
          order: "string",
        };

        const response = await request(app)
          .post("/api/users/:userId/wordReminders")
          .set("Accept", "application/json")
          .send(body);

        expect(response.headers["content-type"]).toMatch(/json/);
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          errors: [
            {
              location: "body",
              msg: `'order' must be a value in this enum: ${Object.values(
                Order
              ).filter((value) => typeof value === "string")}.`,
              path: "order",
              type: "field",
              value: "string",
            },
          ],
        });
      });
    });
  });

  it("the next request handler is called", async () => {
    const body = {
      finish: new Date(),
      auto: false,
      words: [userWord1, userWord2, userWord3],
      isActive: false,
      hasReminderOnload: false,
      reminder: "every hour",
    };

    const response = await request(app)
      .post("/api/users/:userId/wordReminders")
      .set("Accept", "application/json")
      .send(body);

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message,
    });
  });
});
