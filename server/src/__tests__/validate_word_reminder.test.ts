import { SortMode } from "common";
import express, { Request, Response } from "express";
import request from "supertest";

import { errorValidationHandler } from "../middleware/error_validation_handler";
import {
  validateAutoWordReminder,
  validateOptions,
  validateWordReminder,
} from "../middleware/validate_word_reminder";

const message = "Success!";
const userId = 1;
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

describe("validateWordReminder", () => {
  describe("validateOptions", () => {
    describe("is_active", () => {
      it("returns 400 status code when 'is_active' is not provided", async () => {
        const app = express();
        app.use(express.json());
        app.post(
          "/api/users/:userId/wordReminders",
          validateOptions,
          errorValidationHandler,
          (req: Request, res: Response) => {
            res.status(200).json({ message });
          }
        );
        const body = {
          is_active: undefined,
          has_reminder_onload: false,
          reminder: "* * * * *",
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
          (req: Request, res: Response) => {
            res.status(200).json({ message });
          }
        );
        const body = {
          is_active: "string",
          has_reminder_onload: false,
          reminder: "* * * * *",
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
          (req: Request, res: Response) => {
            res.status(200).json({ message });
          }
        );
        const body = {
          is_active: false,
          has_reminder_onload: undefined,
          reminder: "* * * * *",
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
          (req: Request, res: Response) => {
            res.status(200).json({ message });
          }
        );
        const body = {
          is_active: false,
          has_reminder_onload: "string",
          reminder: "* * * * *",
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
          (req: Request, res: Response) => {
            res.status(200).json({ message });
          }
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
              msg: "'reminder' must be specified.",
              path: "reminder",
              type: "field",
              value: "",
            },
          ],
        });
      });

      it("returns 400 status code when 'reminder' is not a valid cron expression", async () => {
        const app = express();
        app.use(express.json());
        app.post(
          "/api/users/:userId/wordReminders",
          validateOptions,
          errorValidationHandler,
          (req: Request, res: Response) => {
            res.status(200).json({ message });
          }
        );
        const body = {
          is_active: false,
          has_reminder_onload: false,
          reminder: "* * * *dsadsadsa2i1*",
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
              msg: "Unknown alias: dsa",
              path: "reminder",
              type: "field",
              value: body.reminder,
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
        (req: Request, res: Response) => {
          res.status(200).json({ message });
        }
      );
      const body = {
        is_active: false,
        has_reminder_onload: false,
        reminder: "* * * * *",
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
          (req: Request, res: Response) => {
            res.status(200).json({ message });
          }
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
          (req: Request, res: Response) => {
            res.status(200).json({ message });
          }
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
          (req: Request, res: Response) => {
            res.status(200).json({ message });
          }
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
          (req: Request, res: Response) => {
            res.status(200).json({ message });
          }
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
          (req: Request, res: Response) => {
            res.status(200).json({ message });
          }
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
        (req: Request, res: Response) => {
          res.status(200).json({ message });
        }
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
          (req: Request, res: Response) => {
            res.status(200).json({ message });
          }
        );
        const body = {
          create_now: true,
          duration: 3600000,
          has_learned_words: false,
          sort_mode: SortMode.Random,
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
          (req: Request, res: Response) => {
            res.status(200).json({ message });
          }
        );
        const body = {
          create_now: true,
          duration: 3600000,
          has_learned_words: false,
          sort_mode: SortMode.Random,
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
          (req: Request, res: Response) => {
            res.status(200).json({ message });
          }
        );
        const body = {
          create_now: false,
          duration: undefined,
          has_learned_words: false,
          sort_mode: SortMode.Random,
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
              msg: "'duration' must be specified.",
              path: "duration",
              type: "field",
            },
          ],
        });
      });

      it("returns 400 status code when duration properties must be a positive integer", async () => {
        const app = express();
        app.use(express.json());
        app.post(
          "/api/users/:userId/wordReminders",
          validateAutoWordReminder,
          errorValidationHandler,
          (req: Request, res: Response) => {
            res.status(200).json({ message });
          }
        );
        const body = {
          create_now: false,
          word_count: 7,
          duration: 0,
          has_learned_words: false,
          sort_mode: SortMode.Random,
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
              msg: "'duration' must be a positive integer.",
              path: "duration",
              type: "field",
              value: 0,
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
          (req: Request, res: Response) => {
            res.status(200).json({ message });
          }
        );
        const body = {
          create_now: undefined,
          word_count: 7,
          has_learned_words: true,
          duration: 3600000,
          sort_mode: SortMode.Random,
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
          (req: Request, res: Response) => {
            res.status(200).json({ message });
          }
        );
        const body = {
          create_now: "string",
          word_count: 7,
          duration: 3600000,
          has_learned_words: false,
          sort_mode: SortMode.Random,
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
          (req: Request, res: Response) => {
            res.status(200).json({ message });
          }
        );
        const body = {
          create_now: true,
          word_count: 7,
          duration: 36000000,
          has_learned_words: undefined,
          sort_mode: SortMode.Random,
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
          (req: Request, res: Response) => {
            res.status(200).json({ message });
          }
        );
        const body = {
          create_now: true,
          word_count: 7,
          duration: 36000000,
          has_learned_words: "string",
          sort_mode: SortMode.Random,
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

    describe("sort_mode", () => {
      it("returns 400 status code when 'sort_mode' is not provided", async () => {
        const app = express();
        app.use(express.json());
        app.post(
          "/api/users/:userId/wordReminders",
          validateAutoWordReminder,
          errorValidationHandler,
          (req: Request, res: Response) => {
            res.status(200).json({ message });
          }
        );
        const body = {
          create_now: true,
          word_count: 7,
          duration: 36000000,
          has_learned_words: true,
          sort_mode: undefined,
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
              msg: "'sort_mode' must be specified.",
              path: "sort_mode",
              type: "field",
            },
          ],
        });
      });

      it("returns 400 status code when 'sort_mode' is not one of the 'SortMode' enum values", async () => {
        const app = express();
        app.use(express.json());
        app.post(
          "/api/users/:userId/wordReminders",
          validateAutoWordReminder,
          errorValidationHandler,
          (req: Request, res: Response) => {
            res.status(200).json({ message });
          }
        );
        const body = {
          create_now: true,
          word_count: 7,
          duration: 36000000,
          has_learned_words: false,
          sort_mode: "string",
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
              msg: `'sort_mode' must be a value in this enum: ${Object.values(
                SortMode
              ).filter((value) => typeof value === "string")}.`,
              path: "sort_mode",
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
        (req: Request, res: Response) => {
          res.status(200).json({ message });
        }
      );
      const body = {
        create_now: true,
        word_count: 7,
        duration: 3600000,
        has_learned_words: false,
        sort_mode: SortMode.Random,
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
