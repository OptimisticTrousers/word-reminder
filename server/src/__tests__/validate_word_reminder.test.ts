import express from "express";
import asyncHandler from "express-async-handler";
import request from "supertest";

import { errorValidationHandler } from "../middleware/error_validation_handler";
import {
  validateAutoWordReminder,
  validateOptions,
  validateWordReminder,
} from "../middleware/validate_word_reminder";
import { Order } from "common";

describe("validateWordReminder", () => {
  const message = "Success!";
  const userId = "1";
  const userWord1 = {
    id: 1,
    word_id: 1,
    user_id: userId,
    learned: false,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const userWord2 = {
    id: 2,
    word_id: 2,
    user_id: userId,
    learned: false,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const userWord3 = {
    id: 3,
    word_id: 3,
    user_id: userId,
    learned: false,
    created_at: new Date(),
    updated_at: new Date(),
  };

  describe("validateOptions", () => {
    describe("is_active", () => {
      it("returns 400 status code when 'is_active' is not provided", async () => {
        const app = express();
        app.use(express.json());
        app.post(
          "/api/users/:userId/wordReminders",
          validateOptions,
          errorValidationHandler,
          asyncHandler(async (req, res, next) => {
            res.status(200).json({ message });
          })
        );
        const body = {
          is_active: undefined,
          has_reminder_onload: false,
          reminder: {
            minutes: 0,
            hours: 1,
            days: 0,
            weeks: 0,
            months: 0,
          },
        };

        const response = await request(app)
          .post(`/api/users/${userId}/wordReminders`)
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
        const app = express();
        app.use(express.json());
        app.post(
          "/api/users/:userId/wordReminders",
          validateOptions,
          errorValidationHandler,
          asyncHandler(async (req, res, next) => {
            res.status(200).json({ message });
          })
        );
        const body = {
          is_active: "string",
          has_reminder_onload: false,
          reminder: {
            minutes: 0,
            hours: 1,
            days: 0,
            weeks: 0,
            months: 0,
          },
        };

        const response = await request(app)
          .post(`/api/users/${userId}/wordReminders`)
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
        const app = express();
        app.use(express.json());
        app.post(
          "/api/users/:userId/wordReminders",
          validateOptions,
          errorValidationHandler,
          asyncHandler(async (req, res, next) => {
            res.status(200).json({ message });
          })
        );
        const body = {
          is_active: false,
          has_reminder_onload: undefined,
          reminder: {
            minutes: 0,
            hours: 1,
            days: 0,
            weeks: 0,
            months: 0,
          },
        };
        const response = await request(app)
          .post(`/api/users/${userId}/wordReminders`)
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
        const app = express();
        app.use(express.json());
        app.post(
          "/api/users/:userId/wordReminders",
          validateOptions,
          errorValidationHandler,
          asyncHandler(async (req, res, next) => {
            res.status(200).json({ message });
          })
        );
        const body = {
          is_active: false,
          has_reminder_onload: "string",
          reminder: {
            minutes: 0,
            hours: 1,
            days: 0,
            weeks: 0,
            months: 0,
          },
        };

        const response = await request(app)
          .post(`/api/users/${userId}/wordReminders`)
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
        const app = express();
        app.use(express.json());
        app.post(
          "/api/users/:userId/wordReminders",
          validateOptions,
          errorValidationHandler,
          asyncHandler(async (req, res, next) => {
            res.status(200).json({ message });
          })
        );
        const body = {
          is_active: false,
          has_reminder_onload: false,
          reminder: undefined,
        };

        const response = await request(app)
          .post(`/api/users/${userId}/wordReminders`)
          .set("Accept", "application/json")
          .send(body);

        expect(response.headers["content-type"]).toMatch(/json/);
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          errors: [
            {
              location: "body",
              msg: "'reminder.minutes' must be specified.",
              path: "reminder.minutes",
              type: "field",
            },
            {
              location: "body",
              msg: "'reminder.hours' must be specified.",
              path: "reminder.hours",
              type: "field",
            },
            {
              location: "body",
              msg: "'reminder.days' must be specified.",
              path: "reminder.days",
              type: "field",
            },
            {
              location: "body",
              msg: "'reminder.weeks' must be specified.",
              path: "reminder.weeks",
              type: "field",
            },
            {
              location: "body",
              msg: "'reminder.months' must be specified.",
              path: "reminder.months",
              type: "field",
            },
          ],
        });
      });

      it("returns 400 status code when reminder properties are not provided", async () => {
        const app = express();
        app.use(express.json());
        app.post(
          "/api/users/:userId/wordReminders",
          validateOptions,
          errorValidationHandler,
          asyncHandler(async (req, res, next) => {
            res.status(200).json({ message });
          })
        );
        const body = {
          is_active: false,
          has_reminder_onload: false,
          reminder: {
            minutes: undefined,
            hours: undefined,
            days: undefined,
            weeks: undefined,
            months: undefined,
          },
        };

        const response = await request(app)
          .post(`/api/users/${userId}/wordReminders`)
          .set("Accept", "application/json")
          .send(body);

        expect(response.headers["content-type"]).toMatch(/json/);
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          errors: [
            {
              location: "body",
              msg: "'reminder.minutes' must be specified.",
              path: "reminder.minutes",
              type: "field",
            },
            {
              location: "body",
              msg: "'reminder.hours' must be specified.",
              path: "reminder.hours",
              type: "field",
            },
            {
              location: "body",
              msg: "'reminder.days' must be specified.",
              path: "reminder.days",
              type: "field",
            },
            {
              location: "body",
              msg: "'reminder.weeks' must be specified.",
              path: "reminder.weeks",
              type: "field",
            },
            {
              location: "body",
              msg: "'reminder.months' must be specified.",
              path: "reminder.months",
              type: "field",
            },
          ],
        });
      });

      it("returns 400 status code when reminder properties are not positive integers", async () => {
        const app = express();
        app.use(express.json());
        app.post(
          "/api/users/:userId/wordReminders",
          validateOptions,
          errorValidationHandler,
          asyncHandler(async (req, res, next) => {
            res.status(200).json({ message });
          })
        );
        const body = {
          is_active: false,
          has_reminder_onload: false,
          reminder: {
            minutes: -1,
            hours: -2,
            days: -3,
            weeks: -4,
            months: -5,
          },
        };

        const response = await request(app)
          .post(`/api/users/${userId}/wordReminders`)
          .set("Accept", "application/json")
          .send(body);

        expect(response.headers["content-type"]).toMatch(/json/);
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          errors: [
            {
              location: "body",
              msg: "'reminder.minutes' must be a non-negative integer.",
              path: "reminder.minutes",
              type: "field",
              value: -1,
            },
            {
              location: "body",
              msg: "'reminder.hours' must be a non-negative integer.",
              path: "reminder.hours",
              type: "field",
              value: -2,
            },
            {
              location: "body",
              msg: "'reminder.days' must be a non-negative integer.",
              path: "reminder.days",
              type: "field",
              value: -3,
            },
            {
              location: "body",
              msg: "'reminder.weeks' must be a non-negative integer.",
              path: "reminder.weeks",
              type: "field",
              value: -4,
            },
            {
              location: "body",
              msg: "'reminder.months' must be a non-negative integer.",
              path: "reminder.months",
              type: "field",
              value: -5,
            },
          ],
        });
      });
    });

    it("the next request handler is called", async () => {
      const app = express();
      app.use(express.json());
      app.post(
        "/api/users/:userId/wordReminders",
        validateOptions,
        errorValidationHandler,
        asyncHandler(async (req, res, next) => {
          res.status(200).json({ message });
        })
      );
      const body = {
        is_active: false,
        has_reminder_onload: false,
        reminder: {
          minutes: 0,
          hours: 1,
          days: 0,
          weeks: 0,
          months: 0,
        },
      };

      const response = await request(app)
        .post(`/api/users/${userId}/wordReminders`)
        .set("Accept", "application/json")
        .send(body);

      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message,
      });
    });
  });

  describe("validateWordReminder", () => {
    describe("finish", () => {
      it("returns 400 status code when 'finish' is not provided", async () => {
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
        const body = {
          finish: undefined,
          user_words: [userWord1, userWord2, userWord3],
        };

        const response = await request(app)
          .post(`/api/users/${userId}/wordReminders`)
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
        const body = {
          finish: "string",
          user_words: [userWord1, userWord2, userWord3],
        };

        const response = await request(app)
          .post(`/api/users/${userId}/wordReminders`)
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
        const finish = new Date(1);
        const body = {
          finish,
          user_words: [userWord1, userWord2, userWord3],
        };

        const response = await request(app)
          .post(`/api/users/${userId}/wordReminders`)
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
        const body = {
          finish: new Date(Date.now() + 1000),
          user_words: undefined,
        };

        const response = await request(app)
          .post(`/api/users/${userId}/wordReminders`)
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

      it("returns 400 status code when 'user_words' is not an array", async () => {
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
        const body = {
          finish: new Date(Date.now() + 1000),
          user_words: "string",
        };

        const response = await request(app)
          .post(`/api/users/${userId}/wordReminders`)
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
      const body = {
        finish: new Date(Date.now() + 1000),
        user_words: ["1", "2"],
      };

      const response = await request(app)
        .post(`/api/users/${userId}/wordReminders`)
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
        const app = express();
        app.use(express.json());
        app.post(
          "/api/users/:userId/wordReminders",
          validateAutoWordReminder,
          errorValidationHandler,
          asyncHandler(async (req, res, next) => {
            res.status(200).json({ message });
          })
        );
        const body = {
          create_now: true,
          duration: {
            minutes: 0,
            hours: 0,
            days: 0,
            weeks: 1,
            months: 0,
          },
          has_learned_words: false,
          order: Order.Random,
          word_count: undefined,
        };

        const response = await request(app)
          .post(`/api/users/${userId}/wordReminders`)
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
        const app = express();
        app.use(express.json());
        app.post(
          "/api/users/:userId/wordReminders",
          validateAutoWordReminder,
          errorValidationHandler,
          asyncHandler(async (req, res, next) => {
            res.status(200).json({ message });
          })
        );
        const body = {
          create_now: true,
          duration: {
            minutes: 0,
            hours: 0,
            days: 0,
            weeks: 1,
            months: 0,
          },
          has_learned_words: false,
          order: Order.Random,
          word_count: "string",
        };

        const response = await request(app)
          .post(`/api/users/${userId}/wordReminders`)
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
        const app = express();
        app.use(express.json());
        app.post(
          "/api/users/:userId/wordReminders",
          validateAutoWordReminder,
          errorValidationHandler,
          asyncHandler(async (req, res, next) => {
            res.status(200).json({ message });
          })
        );
        const body = {
          create_now: false,
          duration: undefined,
          has_learned_words: false,
          order: Order.Random,
          word_count: 7,
        };

        const response = await request(app)
          .post(`/api/users/${userId}/wordReminders`)
          .set("Accept", "application/json")
          .send(body);

        expect(response.headers["content-type"]).toMatch(/json/);
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          errors: [
            {
              location: "body",
              msg: "'duration.minutes' must be specified.",
              path: "duration.minutes",
              type: "field",
            },
            {
              location: "body",
              msg: "'duration.hours' must be specified.",
              path: "duration.hours",
              type: "field",
            },
            {
              location: "body",
              msg: "'duration.days' must be specified.",
              path: "duration.days",
              type: "field",
            },
            {
              location: "body",
              msg: "'duration.weeks' must be specified.",
              path: "duration.weeks",
              type: "field",
            },
            {
              location: "body",
              msg: "'duration.months' must be specified.",
              path: "duration.months",
              type: "field",
            },
          ],
        });
      });

      it("returns 400 status code when duration properties are not provided", async () => {
        const app = express();
        app.use(express.json());
        app.post(
          "/api/users/:userId/wordReminders",
          validateAutoWordReminder,
          errorValidationHandler,
          asyncHandler(async (req, res, next) => {
            res.status(200).json({ message });
          })
        );
        const body = {
          create_now: false,
          word_count: 7,
          duration: {
            minutes: "",
            hours: "",
            days: "",
            weeks: "",
            months: "",
          },
          has_learned_words: false,
          order: Order.Random,
        };

        const response = await request(app)
          .post(`/api/users/${userId}/wordReminders`)
          .set("Accept", "application/json")
          .send(body);

        expect(response.headers["content-type"]).toMatch(/json/);
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          errors: [
            {
              location: "body",
              msg: "'duration.minutes' must be specified.",
              path: "duration.minutes",
              type: "field",
              value: "",
            },
            {
              location: "body",
              msg: "'duration.hours' must be specified.",
              path: "duration.hours",
              type: "field",
              value: "",
            },
            {
              location: "body",
              msg: "'duration.days' must be specified.",
              path: "duration.days",
              type: "field",
              value: "",
            },
            {
              location: "body",
              msg: "'duration.weeks' must be specified.",
              path: "duration.weeks",
              type: "field",
              value: "",
            },
            {
              location: "body",
              msg: "'duration.months' must be specified.",
              path: "duration.months",
              type: "field",
              value: "",
            },
          ],
        });
      });

      it("returns 400 status code when duration properties are not positive integers", async () => {
        const app = express();
        app.use(express.json());
        app.post(
          "/api/users/:userId/wordReminders",
          validateAutoWordReminder,
          errorValidationHandler,
          asyncHandler(async (req, res, next) => {
            res.status(200).json({ message });
          })
        );
        const body = {
          create_now: true,
          word_count: 7,
          duration: {
            minutes: -1,
            hours: -2,
            days: -3,
            weeks: -4,
            months: -5,
          },
          has_learned_words: false,
          order: Order.Random,
        };

        const response = await request(app)
          .post(`/api/users/${userId}/wordReminders`)
          .set("Accept", "application/json")
          .send(body);

        expect(response.headers["content-type"]).toMatch(/json/);
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          errors: [
            {
              location: "body",
              msg: "'duration.minutes' must be a non-negative integer.",
              path: "duration.minutes",
              type: "field",
              value: -1,
            },
            {
              location: "body",
              msg: "'duration.hours' must be a non-negative integer.",
              path: "duration.hours",
              type: "field",
              value: -2,
            },
            {
              location: "body",
              msg: "'duration.days' must be a non-negative integer.",
              path: "duration.days",
              type: "field",
              value: -3,
            },
            {
              location: "body",
              msg: "'duration.weeks' must be a non-negative integer.",
              path: "duration.weeks",
              type: "field",
              value: -4,
            },
            {
              location: "body",
              msg: "'duration.months' must be a non-negative integer.",
              path: "duration.months",
              type: "field",
              value: -5,
            },
          ],
        });
      });
    });

    describe("create_now", () => {
      it("returns 400 status code when 'create_now' is not provided", async () => {
        const app = express();
        app.use(express.json());
        app.post(
          "/api/users/:userId/wordReminders",
          validateAutoWordReminder,
          errorValidationHandler,
          asyncHandler(async (req, res, next) => {
            res.status(200).json({ message });
          })
        );
        const body = {
          create_now: undefined,
          word_count: 7,
          duration: {
            minutes: 0,
            hours: 0,
            days: 0,
            weeks: 1,
            months: 0,
          },
          has_learned_words: true,
          order: Order.Random,
        };

        const response = await request(app)
          .post(`/api/users/${userId}/wordReminders`)
          .set("Accept", "application/json")
          .send(body);

        expect(response.headers["content-type"]).toMatch(/json/);
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          errors: [
            {
              location: "body",
              msg: "'create_now' must be specified.",
              path: "create_now",
              type: "field",
            },
          ],
        });
      });

      it("returns 400 status code when 'create_now' is not a boolean", async () => {
        const app = express();
        app.use(express.json());
        app.post(
          "/api/users/:userId/wordReminders",
          validateAutoWordReminder,
          errorValidationHandler,
          asyncHandler(async (req, res, next) => {
            res.status(200).json({ message });
          })
        );
        const body = {
          create_now: "string",
          word_count: 7,
          duration: {
            minutes: 0,
            hours: 0,
            days: 0,
            weeks: 1,
            months: 0,
          },
          has_learned_words: false,
          order: Order.Random,
        };

        const response = await request(app)
          .post(`/api/users/${userId}/wordReminders`)
          .set("Accept", "application/json")
          .send(body);

        expect(response.headers["content-type"]).toMatch(/json/);
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          errors: [
            {
              location: "body",
              msg: "'create_now' must be a boolean.",
              path: "create_now",
              type: "field",
              value: "string",
            },
          ],
        });
      });
    });

    describe("has_learned_words", () => {
      it("returns 400 status code when 'has_learned_words' is not provided", async () => {
        const app = express();
        app.use(express.json());
        app.post(
          "/api/users/:userId/wordReminders",
          validateAutoWordReminder,
          errorValidationHandler,
          asyncHandler(async (req, res, next) => {
            res.status(200).json({ message });
          })
        );
        const body = {
          create_now: true,
          word_count: 7,
          duration: {
            minutes: 0,
            hours: 0,
            days: 0,
            weeks: 1,
            months: 0,
          },
          has_learned_words: undefined,
          order: Order.Random,
        };

        const response = await request(app)
          .post(`/api/users/${userId}/wordReminders`)
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
        const app = express();
        app.use(express.json());
        app.post(
          "/api/users/:userId/wordReminders",
          validateAutoWordReminder,
          errorValidationHandler,
          asyncHandler(async (req, res, next) => {
            res.status(200).json({ message });
          })
        );
        const body = {
          create_now: true,
          word_count: 7,
          duration: {
            minutes: 0,
            hours: 0,
            days: 0,
            weeks: 1,
            months: 0,
          },
          has_learned_words: "string",
          order: Order.Random,
        };

        const response = await request(app)
          .post(`/api/users/${userId}/wordReminders`)
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
        const app = express();
        app.use(express.json());
        app.post(
          "/api/users/:userId/wordReminders",
          validateAutoWordReminder,
          errorValidationHandler,
          asyncHandler(async (req, res, next) => {
            res.status(200).json({ message });
          })
        );
        const body = {
          create_now: true,
          word_count: 7,
          duration: {
            minutes: 0,
            hours: 0,
            days: 0,
            weeks: 1,
            months: 0,
          },
          has_learned_words: true,
          order: undefined,
        };

        const response = await request(app)
          .post(`/api/users/${userId}/wordReminders`)
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
        const app = express();
        app.use(express.json());
        app.post(
          "/api/users/:userId/wordReminders",
          validateAutoWordReminder,
          errorValidationHandler,
          asyncHandler(async (req, res, next) => {
            res.status(200).json({ message });
          })
        );
        const body = {
          create_now: true,
          word_count: 7,
          duration: {
            minutes: 0,
            hours: 0,
            days: 0,
            weeks: 1,
            months: 0,
          },
          has_learned_words: false,
          order: "string",
        };

        const response = await request(app)
          .post(`/api/users/${userId}/wordReminders`)
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

    it("the next request handler is called", async () => {
      const app = express();
      app.use(express.json());
      app.post(
        "/api/users/:userId/wordReminders",
        validateAutoWordReminder,
        errorValidationHandler,
        asyncHandler(async (req, res, next) => {
          res.status(200).json({ message });
        })
      );
      const body = {
        create_now: true,
        word_count: 7,
        duration: {
          minutes: 0,
          hours: 0,
          days: 0,
          weeks: 1,
          months: 0,
        },
        has_learned_words: false,
        order: Order.Random,
      };

      const response = await request(app)
        .post(`/api/users/${userId}/wordReminders`)
        .set("Accept", "application/json")
        .send(body);

      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message,
      });
    });
  });
});
