import express, { Request, Response } from "express";
import request from "supertest";

import { errorValidationHandler } from "../middleware/error_validation_handler";
import { validateUserWord } from "../middleware/validate_user_word";

const userId = 1;
const userWordId = 1;

describe("validate_user_word", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const message = "Success!";

  it("returns 400 status code when the body is empty", async () => {
    const app = express();
    app.use(express.json());
    app.put(
      `/api/users/${userId}/userWords/${userWordId}`,
      validateUserWord,
      errorValidationHandler,
      (req: Request, res: Response) => {
        res.status(200).json({ message });
      }
    );
    const body = {};

    const response = await request(app)
      .put(`/api/users/${userId}/userWords/${userWordId}`)
      .set("Accept", "application/json")
      .send(body);

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      errors: [
        {
          location: "body",
          msg: "'learned' must be specified.",
          path: "learned",
          type: "field",
        },
      ],
    });
  });

  it("returns 400 status code when the 'learned' is not a boolean", async () => {
    const app = express();
    app.use(express.json());
    app.put(
      `/api/users/${userId}/userWords/${userWordId}`,
      validateUserWord,
      errorValidationHandler,
      (req: Request, res: Response) => {
        res.status(200).json({ message });
      }
    );
    const body = {
      learned: "string",
    };

    const response = await request(app)
      .put(`/api/users/${userId}/userWords/${userWordId}`)
      .set("Accept", "application/json")
      .send(body);

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      errors: [
        {
          location: "body",
          msg: "'learned' must be a boolean.",
          path: "learned",
          type: "field",
          value: body.learned,
        },
      ],
    });
  });

  it("calls the following request handler when body is valid", async () => {
    const app = express();
    app.use(express.json());
    app.put(
      `/api/users/${userId}/userWords/${userWordId}`,
      validateUserWord,
      errorValidationHandler,
      (req: Request, res: Response) => {
        res.status(200).json({ message });
      }
    );
    const body = {
      learned: false,
    };

    const response = await request(app)
      .put(`/api/users/${userId}/userWords/${userWordId}`)
      .set("Accept", "application/sjon")
      .send(body);

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message });
  });
});
