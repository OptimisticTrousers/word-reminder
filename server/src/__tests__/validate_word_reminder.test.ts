import express from "express";
import asyncHandler from "express-async-handler";
import request from "supertest";

import { errorValidationHandler } from "../middleware/error_validation_handler";
import {
  validateAutoWordReminder,
  validateAuto,
  validateWordReminder,
} from "../middleware/validate_word_reminder";
import { Order } from "common";

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
    validateAuto,
    validateWordReminder,
    validateAutoWordReminder,
    errorValidationHandler,
    asyncHandler(async (req, res, next) => {
      res.status(200).json({ message });
    })
  );

  describe("auto", () => {
    it("returns 400 status code when 'auto' is not provided", async () => {
      const body = {
        auto: undefined,
        finish: new Date(Date.now() + 1000), // make sure date comes after current date
        user_words: [userWord1, userWord2, userWord3],
        is_active: false,
        has_reminder_onload: false,
        reminder: "1 hour",
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
        finish: new Date(Date.now() + 1000), // make sure date comes after current date
        user_words: [userWord1, userWord2, userWord3],
        is_active: false,
        has_reminder_onload: false,
        reminder: "1 hour",
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

  describe("is_active", () => {
    it("returns 400 status code when 'is_active' is not provided", async () => {
      const body = {
        finish: new Date(Date.now() + 1000), // make sure date comes after current date
        auto: false,
        user_words: [userWord1, userWord2, userWord3],
        is_active: undefined,
        has_reminder_onload: false,
        reminder: "1 hour",
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
            msg: "'is_active' must be specified.",
            path: "is_active",
            type: "field",
          },
        ],
      });
    });

    it("returns 400 status code when 'is_active' is not a boolean", async () => {
      const body = {
        finish: new Date(Date.now() + 1000), // make sure date comes after current date
        auto: false,
        user_words: [userWord1, userWord2, userWord3],
        is_active: "string",
        has_reminder_onload: false,
        reminder: "1 hour",
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
            msg: "'is_active' must be a boolean.",
            path: "is_active",
            type: "field",
            value: "string",
          },
        ],
      });
    });
  });

  describe("has_reminder_onload", () => {
    it("returns 400 status code when 'has_reminder_onload' is not provided", async () => {
      const body = {
        finish: new Date(Date.now() + 1000), // make sure date comes after current date
        auto: false,
        user_words: [userWord1, userWord2, userWord3],
        is_active: false,
        has_reminder_onload: undefined,
        reminder: "1 hour",
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
            msg: "'has_reminder_onload' must be specified.",
            path: "has_reminder_onload",
            type: "field",
          },
        ],
      });
    });

    it("returns 400 status code when 'has_reminder_onload' is not a boolean", async () => {
      const body = {
        finish: new Date(Date.now() + 1000), // make sure date comes after current date
        auto: false,
        user_words: [userWord1, userWord2, userWord3],
        is_active: false,
        has_reminder_onload: "string",
        reminder: "1 hour",
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
            msg: "'has_reminder_onload' must be a boolean.",
            path: "has_reminder_onload",
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
        finish: new Date(Date.now() + 1000), // make sure date comes after current date
        auto: false,
        user_words: [userWord1, userWord2, userWord3],
        is_active: false,
        has_reminder_onload: false,
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
          user_words: [userWord1, userWord2, userWord3],
          is_active: false,
          has_reminder_onload: false,
          reminder: "1 hour",
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
          user_words: [userWord1, userWord2, userWord3],
          is_active: false,
          has_reminder_onload: false,
          reminder: "1 hour",
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
          user_words: [userWord1, userWord2, userWord3],
          is_active: false,
          has_reminder_onload: false,
          reminder: "1 hour",
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

    describe("user_words", () => {
      it("returns 400 status code when 'user_words' is not provided", async () => {
        const body = {
          finish: new Date(Date.now() + 1000), // make sure date comes after current date
          auto: false,
          user_words: undefined,
          is_active: false,
          has_reminder_onload: false,
          reminder: "1 hour",
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
              msg: "'user_words' must be specified.",
              path: "user_words",
              type: "field",
            },
          ],
        });
      });

      it("returns 400 status code when 'words' is not an array", async () => {
        const body = {
          finish: new Date(Date.now() + 1000), // make sure date comes after current date
          auto: false,
          user_words: "string",
          is_active: false,
          has_reminder_onload: false,
          reminder: "1 hour",
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
              msg: "'user_words' must be an array.",
              path: "user_words",
              type: "field",
              value: "string",
            },
          ],
        });
      });
    });

    it("the next request handler is called", async () => {
      const body = {
        finish: new Date(Date.now() + 1000), // make sure date comes after current date
        auto: false,
        user_words: [userWord1, userWord2, userWord3],
        is_active: false,
        has_reminder_onload: false,
        reminder: "1 hour",
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

  describe("validateAutoWordReminder", () => {
    describe("word_count", () => {
      it("returns 400 status code when 'word_count' is not provided", async () => {
        const body = {
          auto: true,
          word_count: undefined,
          is_active: false,
          has_reminder_onload: false,
          reminder: "1 hour",
          duration: "1 week",
          has_learned_words: false,
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
              msg: "'word_count' must be specified.",
              path: "word_count",
              type: "field",
            },
          ],
        });
      });

      it("returns 400 status code when 'word_count' is not a number", async () => {
        const body = {
          auto: true,
          word_count: "string",
          is_active: false,
          has_reminder_onload: false,
          reminder: "1 hour",
          duration: "1 week",
          has_learned_words: false,
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
              msg: "'word_count' must be a positive integer.",
              path: "word_count",
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
          word_count: 7,
          is_active: false,
          has_reminder_onload: false,
          reminder: "1 hour",
          duration: undefined,
          has_learned_words: false,
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
    });

    describe("has_learned_words", () => {
      it("returns 400 status code when 'has_learned_words' is not provided", async () => {
        const body = {
          auto: true,
          word_count: 7,
          is_active: false,
          has_reminder_onload: false,
          reminder: "1 hour",
          duration: "1 week",
          has_learned_words: undefined,
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
              msg: "'has_learned_words' must be specified.",
              path: "has_learned_words",
              type: "field",
            },
          ],
        });
      });

      it("returns 400 status code when 'has_learned_words' is not a boolean", async () => {
        const body = {
          auto: true,
          word_count: 7,
          is_active: false,
          has_reminder_onload: false,
          reminder: "1 hour",
          duration: "1 week",
          has_learned_words: "string",
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
              msg: "'has_learned_words' must be a boolean.",
              path: "has_learned_words",
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
          word_count: 7,
          is_active: false,
          has_reminder_onload: false,
          reminder: "1 hour",
          duration: "1 week",
          has_learned_words: true,
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
          word_count: 7,
          is_active: false,
          has_reminder_onload: false,
          reminder: "1 hour",
          duration: "1 week",
          has_learned_words: false,
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
      auto: true,
      word_count: 7,
      is_active: false,
      has_reminder_onload: false,
      reminder: "1 hour",
      duration: "1 week",
      has_learned_words: false,
      order: Order.Random,
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
