import bcrypt from "bcryptjs";
import express from "express";
import request from "supertest";

import { variables } from "../config/variables";
import { update_user } from "../controllers/user_controller";
import { userQueries } from "../db/user_queries";
import { emailExists } from "../utils/email_exists";

const { SALT } = variables;

jest.mock("../utils/email_exists", () => ({
  emailExists: jest.fn().mockResolvedValue(true),
}));

describe("update_user", () => {
  const user = {
    id: "1",
    email: "bob@protonmail.com",
    auto: true,
    confirmed: false,
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("when the session has a user", () => {
    it("calls the functions to update password", async () => {
      const app = express();
      app.use(express.json());
      app.use((req, res, next) => {
        req.user = user;
        next();
      });
      app.put("/api/users/:userId", update_user);
      const hashSpy = jest.spyOn(bcrypt, "hash");
      const mockUserQueriesGet = jest
        .spyOn(userQueries, "get")
        .mockResolvedValue(user)
        .mockName("get");
      const mockUpdateById = jest
        .spyOn(userQueries, "updateById")
        .mockResolvedValue(user)
        .mockName("updateById");
      const body = {
        oldPassword: "correctPassword",
        newPassword: "password2",
        newPasswordConfirmation: "password2",
      };

      const response = await request(app)
        .put(`/api/users/${user.id}`)
        .set("Accept", "application/json")
        .send(body);

      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        user: {
          ...user,
          created_at: user.created_at.toISOString(),
          updated_at: user.updated_at.toISOString(),
        },
      });
      expect(mockUserQueriesGet).toHaveBeenCalledTimes(1);
      expect(mockUserQueriesGet).toHaveBeenCalledWith({
        id: user.id,
        password: expect.any(String),
      });
      expect(hashSpy).toHaveBeenCalledTimes(2);
      expect(hashSpy).toHaveBeenNthCalledWith(
        1,
        body.oldPassword,
        Number(SALT)
      );
      expect(hashSpy).toHaveBeenNthCalledWith(
        2,
        body.newPassword,
        Number(SALT)
      );
      expect(mockUpdateById).toHaveBeenCalledTimes(1);
      expect(mockUpdateById).toHaveBeenCalledWith(user.id, {
        password: expect.any(String),
      });
    });

    it("calls the functions to update email", async () => {
      const app = express();
      app.use(express.json());
      app.use((req, res, next) => {
        req.user = user;
        next();
      });
      app.put("/api/users/:userId", update_user);
      const hashSpy = jest.spyOn(bcrypt, "hash");
      const mockUserQueriesGet = jest
        .spyOn(userQueries, "get")
        .mockResolvedValue(user)
        .mockName("get");
      const body = {
        email: "updated@protonmail.com",
        oldPassword: "password1",
      };
      const mockUpdateById = jest
        .spyOn(userQueries, "updateById")
        .mockResolvedValue({ ...user, email: body.email })
        .mockName("updateById");

      const response = await request(app)
        .put(`/api/users/${user.id}`)
        .set("Accept", "application/json")
        .send(body);

      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        user: {
          ...user,
          email: body.email,
          created_at: user.created_at.toISOString(),
          updated_at: user.updated_at.toISOString(),
        },
      });
      expect(hashSpy).toHaveBeenCalledTimes(1);
      expect(hashSpy).toHaveBeenLastCalledWith(body.oldPassword, Number(SALT));
      expect(mockUserQueriesGet).toHaveBeenCalledTimes(1);
      expect(mockUserQueriesGet).toHaveBeenCalledWith({
        id: user.id,
        password: expect.any(String),
      });
      expect(mockUpdateById).toHaveBeenCalledTimes(1);
      expect(mockUpdateById).toHaveBeenNthCalledWith(1, user.id, {
        email: body.email,
      });
      expect(emailExists).toHaveBeenCalledTimes(1);
    });

    it("calls the functions to update email only when email and passwords are provided", async () => {
      const app = express();
      app.use(express.json());
      app.use((req, res, next) => {
        req.user = user;
        next();
      });
      app.put("/api/users/:userId", update_user);
      const hashSpy = jest.spyOn(bcrypt, "hash");
      const mockUserQueriesGet = jest
        .spyOn(userQueries, "get")
        .mockResolvedValue(user)
        .mockName("get");
      const body = {
        email: "updated@protonmail.com",
        oldPassword: "password1",
        newPassword: "password2",
        newPasswordConfirmation: "password2",
      };
      const mockUpdateById = jest
        .spyOn(userQueries, "updateById")
        .mockResolvedValue({ ...user, email: body.email })
        .mockName("updateById");

      const response = await request(app)
        .put(`/api/users/${user.id}`)
        .set("Accept", "application/json")
        .send(body);

      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        user: {
          ...user,
          email: body.email,
          created_at: user.created_at.toISOString(),
          updated_at: user.updated_at.toISOString(),
        },
      });
      expect(hashSpy).toHaveBeenCalledTimes(1);
      expect(hashSpy).toHaveBeenLastCalledWith(body.oldPassword, Number(SALT));
      expect(mockUserQueriesGet).toHaveBeenCalledTimes(1);
      expect(mockUserQueriesGet).toHaveBeenCalledWith({
        id: user.id,
        password: expect.any(String),
      });
      expect(mockUpdateById).toHaveBeenCalledTimes(1);
      expect(mockUpdateById).toHaveBeenNthCalledWith(1, user.id, {
        email: body.email,
      });
      expect(emailExists).toHaveBeenCalledTimes(1);
    });

    describe("validation", () => {
      describe("confirmation", () => {
        it("calls the functions to confirm user", async () => {
          const app = express();
          app.use(express.json());
          app.use((req, res, next) => {
            req.user = user;
            next();
          });
          app.put("/api/users/:userId", update_user);
          const body = {
            confirmed: true,
          };
          const mockUpdateById = jest
            .spyOn(userQueries, "updateById")
            .mockResolvedValue({ ...user, confirmed: body.confirmed })
            .mockName("updateById");

          const response = await request(app)
            .put(`/api/users/${user.id}`)
            .set("Accept", "application/json")
            .send(body);

          expect(response.headers["content-type"]).toMatch(/json/);
          expect(response.status).toBe(200);
          expect(response.body).toEqual({
            user: {
              ...user,
              confirmed: body.confirmed,
              created_at: user.created_at.toISOString(),
              updated_at: user.updated_at.toISOString(),
            },
          });
          expect(mockUpdateById).toHaveBeenCalledTimes(1);
          expect(mockUpdateById).toHaveBeenNthCalledWith(1, user.id, {
            confirmed: body.confirmed,
          });
        });

        it("calls the functions to confirm user even when unnecessary fields are provided", async () => {
          const app = express();
          app.use(express.json());
          app.use((req, res, next) => {
            req.user = user;
            next();
          });
          app.put("/api/users/:userId", update_user);
          const body = {
            email: user.email,
            oldPassword: "password1",
            newPassword: "password2",
            newPasswordConfirmation: "password2",
            confirmed: true,
          };
          const mockUpdateById = jest
            .spyOn(userQueries, "updateById")
            .mockResolvedValue({ ...user, confirmed: body.confirmed })
            .mockName("updateById");

          const response = await request(app)
            .put(`/api/users/${user.id}`)
            .set("Accept", "application/json")
            .send(body);

          expect(response.headers["content-type"]).toMatch(/json/);
          expect(response.status).toBe(200);
          expect(response.body).toEqual({
            user: {
              ...user,
              confirmed: body.confirmed,
              created_at: user.created_at.toISOString(),
              updated_at: user.updated_at.toISOString(),
            },
          });
          expect(mockUpdateById).toHaveBeenCalledTimes(1);
          expect(mockUpdateById).toHaveBeenNthCalledWith(1, user.id, {
            confirmed: body.confirmed,
          });
        });

        it("returns 400 status when 'confirmation' is not a boolean", async () => {
          const app = express();
          app.use(express.json());
          app.use((req, res, next) => {
            req.user = user;
            next();
          });
          app.put("/api/users/:userId", update_user);
          const body = {
            confirmed: "not a bool",
          };

          const response = await request(app)
            .put(`/api/users/${user.id}`)
            .set("Accept", "application/json")
            .send(body);

          expect(response.headers["content-type"]).toMatch(/json/);
          expect(response.status).toBe(400);
          expect(response.body).toEqual({
            errors: [
              {
                location: "body",
                msg: "'confirmed' must be a boolean.",
                path: "confirmed",
                type: "field",
                value: body.confirmed,
              },
            ],
          });
        });
      });

      describe("updating email", () => {
        it("returns 400 status code when 'email' and 'newPassword' is provided but 'oldPassword' and 'newPasswordConfirmation' is not", async () => {
          const app = express();
          app.use(express.json());
          app.use((req, res, next) => {
            req.user = user;
            next();
          });
          app.put("/api/users/:userId", update_user);
          const body = {
            email: user.email,
            newPassword: "password1",
          };

          const response = await request(app)
            .put(`/api/users/${user.id}`)
            .set("Accept", "application/json")
            .send(body);

          expect(response.headers["content-type"]).toMatch(/json/);
          expect(response.status).toBe(400);
          expect(response.body).toEqual({
            errors: [
              {
                location: "body",
                msg: "'oldPassword' is required when updating 'email'.",
                path: "email",
                type: "field",
                value: body.email,
              },
              {
                location: "body",
                msg: "'newPassword' requires 'newPasswordConfirmation' to be provided.",
                path: "newPassword",
                type: "field",
                value: body.newPassword,
              },
            ],
          });
        });

        it("returns 400 status code when 'email' and 'newPasswordConfirmation' is provided but 'oldPassword' and 'newPasswordConfirmation' is not", async () => {
          const app = express();
          app.use(express.json());
          app.use((req, res, next) => {
            req.user = user;
            next();
          });
          app.put("/api/users/:userId", update_user);
          const body = {
            email: user.email,
            newPasswordConfirmation: "password1",
          };

          const response = await request(app)
            .put(`/api/users/${user.id}`)
            .set("Accept", "application/json")
            .send(body);

          expect(response.headers["content-type"]).toMatch(/json/);
          expect(response.status).toBe(400);
          expect(response.body).toEqual({
            errors: [
              {
                location: "body",
                msg: "'oldPassword' is required when updating 'email'.",
                path: "email",
                type: "field",
                value: body.email,
              },
              {
                location: "body",
                msg: "'newPasswordConfirmation' requires 'newPassword' to be provided.",
                path: "newPasswordConfirmation",
                type: "field",
                value: body.newPasswordConfirmation,
              },
            ],
          });
        });

        it("returns 400 status code when 'email', 'newPassword' and 'newPasswordConfirmation' is provided but 'oldPassword' is not", async () => {
          const app = express();
          app.use(express.json());
          app.use((req, res, next) => {
            req.user = user;
            next();
          });
          app.put("/api/users/:userId", update_user);
          const body = {
            email: user.email,
            newPassword: "password1",
            newPasswordConfirmation: "password1",
          };

          const response = await request(app)
            .put(`/api/users/${user.id}`)
            .set("Accept", "application/json")
            .send(body);

          expect(response.headers["content-type"]).toMatch(/json/);
          expect(response.status).toBe(400);
          expect(response.body).toEqual({
            errors: [
              {
                location: "body",
                msg: "'oldPassword' is required when updating 'email'.",
                path: "email",
                type: "field",
                value: body.email,
              },
              {
                location: "body",
                msg: "'oldPassword' is required when updating 'password'.",
                path: "newPassword",
                type: "field",
                value: body.newPassword,
              },
            ],
          });
          expect(emailExists).toHaveBeenCalledTimes(1);
        });

        it("returns 400 status code when 'email', 'oldPassword' and 'newPasswordConfirmation' is provided but 'newPassword' is not", async () => {
          const app = express();
          app.use(express.json());
          app.use((req, res, next) => {
            req.user = user;
            next();
          });
          app.put("/api/users/:userId", update_user);
          const body = {
            email: user.email,
            oldPassword: "password1",
            newPasswordConfirmation: "password2",
          };

          const response = await request(app)
            .put(`/api/users/${user.id}`)
            .set("Accept", "application/json")
            .send(body);

          expect(response.headers["content-type"]).toMatch(/json/);
          expect(response.status).toBe(400);
          expect(response.body).toEqual({
            errors: [
              {
                location: "body",
                msg: "'newPasswordConfirmation' requires 'newPassword' to be provided.",
                path: "newPasswordConfirmation",
                type: "field",
                value: "password2",
              },
            ],
          });
          expect(emailExists).toHaveBeenCalledTimes(1);
        });

        it("returns 400 status code when 'email', 'oldPassword' and 'newPassword' is provided but 'newPasswordConfirmation' is not", async () => {
          const app = express();
          app.use(express.json());
          app.use((req, res, next) => {
            req.user = user;
            next();
          });
          app.put("/api/users/:userId", update_user);
          const body = {
            email: user.email,
            oldPassword: "password1",
            newPassword: "password2",
          };

          const response = await request(app)
            .put(`/api/users/${user.id}`)
            .set("Accept", "application/json")
            .send(body);

          expect(response.headers["content-type"]).toMatch(/json/);
          expect(response.status).toBe(400);
          expect(response.body).toEqual({
            errors: [
              {
                location: "body",
                msg: "'newPassword' requires 'newPasswordConfirmation' to be provided.",
                path: "newPassword",
                type: "field",
                value: body.newPassword,
              },
            ],
          });
          expect(emailExists).toHaveBeenCalledTimes(1);
        });

        it("returns 400 status code when the email is not a valid email", async () => {
          const app = express();
          app.use(express.json());
          app.use((req, res, next) => {
            req.user = user;
            next();
          });
          app.put("/api/users/:userId", update_user);
          const body = {
            email: "email",
            oldPassword: "password",
          };

          const response = await request(app)
            .put(`/api/users/${user.id}`)
            .set("Accept", "application/json")
            .send(body);

          expect(response.headers["content-type"]).toMatch(/json/);
          expect(response.status).toBe(400);
          expect(response.body).toEqual({
            errors: [
              {
                location: "body",
                msg: "'email' must be a valid email.",
                path: "email",
                type: "field",
                value: "email",
              },
            ],
          });
        });

        it("returns 400 status code when the email is greater than 255 characters", async () => {
          const app = express();
          app.use(express.json());
          app.use((req, res, next) => {
            req.user = user;
            next();
          });
          app.put("/api/users/:userId", update_user);
          const email = new Array(256).fill("a").join("") + "@protonmail.com";
          const body = {
            email,
            oldPassword: "password",
          };

          const response = await request(app)
            .put(`/api/users/${user.id}`)
            .set("Accept", "application/json")
            .send(body);

          expect(response.headers["content-type"]).toMatch(/json/);
          expect(response.status).toBe(400);
          expect(response.body).toEqual({
            errors: [
              {
                location: "body",
                msg: "'email' cannot be greater than 255 characters.",
                path: "email",
                type: "field",
                value: email,
              },
            ],
          });
        });
      });

      describe("updating password", () => {
        it("returns 400 status code when the oldPassword is incorrect", async () => {
          const app = express();
          app.use(express.json());
          app.use((req, res, next) => {
            req.user = user;
            next();
          });
          app.put("/api/users/:userId", update_user);
          const hashSpy = jest.spyOn(bcrypt, "hash");
          const mockUserQueriesGet = jest
            .spyOn(userQueries, "get")
            .mockResolvedValue(undefined)
            .mockName("get");
          const body = {
            oldPassword: "wrongPassword",
            newPassword: "password2",
            newPasswordConfirmation: "password2",
          };

          const response = await request(app)
            .put(`/api/users/${user.id}`)
            .set("Accept", "application/json")
            .send(body);

          expect(response.headers["content-type"]).toMatch(/json/);
          expect(response.status).toBe(400);
          expect(response.body).toEqual({
            message: "You typed your old password incorrectly.",
          });
          expect(mockUserQueriesGet).toHaveBeenCalledTimes(1);
          expect(mockUserQueriesGet).toHaveBeenCalledWith({
            id: user.id,
            password: expect.any(String),
          });
          expect(hashSpy).toHaveBeenCalledTimes(1);
          expect(hashSpy).toHaveBeenCalledWith(body.oldPassword, Number(SALT));
        });

        it("returns 400 status code when 'newPassword' and 'newPasswordConfirmation' are not equal", async () => {
          const app = express();
          app.use(express.json());
          app.use((req, res, next) => {
            req.user = user;
            next();
          });
          app.put("/api/users/:userId", update_user);
          const body = {
            oldPassword: "password1",
            newPassword: "password3",
            newPasswordConfirmation: "password2",
          };

          const response = await request(app)
            .put(`/api/users/${user.id}`)
            .set("Accept", "application/json")
            .send(body);

          expect(response.headers["content-type"]).toMatch(/json/);
          expect(response.status).toBe(400);
          expect(response.body).toEqual({
            errors: [
              {
                location: "body",
                msg: "'newPassword' and 'newPasswordConfirmation' must be equal.",
                path: "newPassword",
                type: "field",
                value: body.newPassword,
              },
            ],
          });
        });

        it("returns 400 status code when 'newPasswordConfirmation' is provided but 'newPassword' and 'oldPassword' is not", async () => {
          const app = express();
          app.use(express.json());
          app.use((req, res, next) => {
            req.user = user;
            next();
          });
          app.put("/api/users/:userId", update_user);
          const body = {
            newPasswordConfirmation: "password1",
          };

          const response = await request(app)
            .put(`/api/users/${user.id}`)
            .set("Accept", "application/json")
            .send(body);

          expect(response.headers["content-type"]).toMatch(/json/);
          expect(response.status).toBe(400);
          expect(response.body).toEqual({
            errors: [
              {
                location: "body",
                msg: "'newPasswordConfirmation' requires 'newPassword' to be provided.",
                path: "newPasswordConfirmation",
                type: "field",
                value: body.newPasswordConfirmation,
              },
            ],
          });
        });

        it("returns 400 status code when 'newPassword' is provided but 'newPasswordConfirmation' and 'oldPassword' is not", async () => {
          const app = express();
          app.use(express.json());
          app.use((req, res, next) => {
            req.user = user;
            next();
          });
          app.put("/api/users/:userId", update_user);
          const body = {
            newPassword: "password1",
          };

          const response = await request(app)
            .put(`/api/users/${user.id}`)
            .set("Accept", "application/json")
            .send(body);

          expect(response.headers["content-type"]).toMatch(/json/);
          expect(response.status).toBe(400);
          expect(response.body).toEqual({
            errors: [
              {
                location: "body",
                msg: "'newPassword' requires 'newPasswordConfirmation' to be provided.",
                path: "newPassword",
                type: "field",
                value: body.newPassword,
              },
            ],
          });
        });

        it("returns 400 status code when 'oldPassword' is provided but 'newPassword' and 'newPasswordConfirmation' is not", async () => {
          const app = express();
          app.use(express.json());
          app.use((req, res, next) => {
            req.user = user;
            next();
          });
          app.put("/api/users/:userId", update_user);
          const body = {
            oldPassword: "password1",
          };

          const response = await request(app)
            .put(`/api/users/${user.id}`)
            .set("Accept", "application/json")
            .send(body);

          expect(response.headers["content-type"]).toMatch(/json/);
          expect(response.status).toBe(400);
          expect(response.body).toEqual({
            errors: [
              {
                location: "body",
                msg: "'oldPassword' requires 'email' or 'newPassword' and 'newPasswordConfirmation' to be provided.",
                path: "oldPassword",
                type: "field",
                value: body.oldPassword,
              },
            ],
          });
        });

        it("returns 400 status code when 'oldPassword' and 'newPassword' is provided but 'newPasswordConfirmation' is not", async () => {
          const app = express();
          app.use(express.json());
          app.use((req, res, next) => {
            req.user = user;
            next();
          });
          app.put("/api/users/:userId", update_user);
          const body = {
            oldPassword: "password1",
            newPassword: "password2",
          };

          const response = await request(app)
            .put(`/api/users/${user.id}`)
            .set("Accept", "application/json")
            .send(body);

          expect(response.headers["content-type"]).toMatch(/json/);
          expect(response.status).toBe(400);
          expect(response.body).toEqual({
            errors: [
              {
                location: "body",
                msg: "'newPassword' requires 'newPasswordConfirmation' to be provided.",
                path: "newPassword",
                type: "field",
                value: body.newPassword,
              },
            ],
          });
        });

        it("returns 400 status code when 'oldPassword' and 'newPasswordConfirmation' is provided but 'newPassword' is not", async () => {
          const app = express();
          app.use(express.json());
          app.use((req, res, next) => {
            req.user = user;
            next();
          });
          app.put("/api/users/:userId", update_user);
          const body = {
            oldPassword: "password1",
            newPasswordConfirmation: "password2",
          };

          const response = await request(app)
            .put(`/api/users/${user.id}`)
            .set("Accept", "application/json")
            .send(body);

          expect(response.headers["content-type"]).toMatch(/json/);
          expect(response.status).toBe(400);
          expect(response.body).toEqual({
            errors: [
              {
                location: "body",
                msg: "'newPasswordConfirmation' requires 'newPassword' to be provided.",
                path: "newPasswordConfirmation",
                type: "field",
                value: body.newPasswordConfirmation,
              },
            ],
          });
        });

        it("returns 400 status code when 'newPassword' and 'newPasswordConfirmation' is provided but 'oldPassword' is not", async () => {
          const app = express();
          app.use(express.json());
          app.use((req, res, next) => {
            req.user = user;
            next();
          });
          app.put("/api/users/:userId", update_user);
          const body = {
            newPassword: "password2",
            newPasswordConfirmation: "password2",
          };

          const response = await request(app)
            .put(`/api/users/${user.id}`)
            .set("Accept", "application/json")
            .send(body);

          expect(response.headers["content-type"]).toMatch(/json/);
          expect(response.status).toBe(400);
          expect(response.body).toEqual({
            errors: [
              {
                location: "body",
                msg: "'oldPassword' is required when updating 'password'.",
                path: "newPassword",
                type: "field",
                value: body.newPassword,
              },
            ],
          });
        });

        it("returns 400 status code when 'newPassword' is greater than 72 characters", async () => {
          const app = express();
          app.use(express.json());
          app.use((req, res, next) => {
            req.user = user;
            next();
          });
          app.put("/api/users/:userId", update_user);
          const password = new Array(73).fill("a").join("");
          const body = {
            newPassword: password,
            oldPassword: "password",
            newPasswordConfirmation: password,
          };

          const response = await request(app)
            .put(`/api/users/${user.id}`)
            .set("Accept", "application/json")
            .send(body);

          expect(response.headers["content-type"]).toMatch(/json/);
          expect(response.status).toBe(400);
          expect(response.body).toEqual({
            errors: [
              {
                location: "body",
                msg: "'newPassword' cannot be greater than 72 characters.",
                path: "newPassword",
                type: "field",
                value: password,
              },
              {
                location: "body",
                msg: "'newPasswordConfirmation' cannot be greater than 72 characters.",
                path: "newPasswordConfirmation",
                type: "field",
                value: password,
              },
            ],
          });
        });

        it("returns 400 status code when 'newPasswordConfirmation' is greater than 72 characters", async () => {
          const app = express();
          app.use(express.json());
          app.use((req, res, next) => {
            req.user = user;
            next();
          });
          app.put("/api/users/:userId", update_user);
          const password = new Array(73).fill("a").join("");
          const body = {
            newPassword: "password",
            oldPassword: "password",
            newPasswordConfirmation: password,
          };

          const response = await request(app)
            .put(`/api/users/${user.id}`)
            .set("Accept", "application/json")
            .send(body);

          expect(response.headers["content-type"]).toMatch(/json/);
          expect(response.status).toBe(400);
          expect(response.body).toEqual({
            errors: [
              {
                location: "body",
                msg: "'newPassword' and 'newPasswordConfirmation' must be equal.",
                path: "newPassword",
                type: "field",
                value: body.oldPassword,
              },
              {
                location: "body",
                msg: "'newPasswordConfirmation' cannot be greater than 72 characters.",
                path: "newPasswordConfirmation",
                type: "field",
                value: password,
              },
            ],
          });
        });
      });

      it("returns 400 status code when the user does provides nothing", async () => {
        const app = express();
        app.use(express.json());
        app.use((req, res, next) => {
          req.user = user;
          next();
        });
        app.put("/api/users/:userId", update_user);
        const body = {};

        const response = await request(app)
          .put(`/api/users/${user.id}`)
          .set("Accept", "application/json")
          .send(body);

        expect(response.headers["content-type"]).toMatch(/json/);
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          errors: [
            {
              location: "body",
              msg: "Request body should not be empty.",
              path: "",
              type: "field",
              value: {},
            },
          ],
        });
      });
    });
  });

  describe("when the session does not have a user", () => {
    it("calls the functions to update password", async () => {
      const app = express();
      app.use(express.json());
      app.use((req, res, next) => {
        req.user = undefined;
        next();
      });
      app.put("/api/users/:userId", update_user);
      const hashSpy = jest.spyOn(bcrypt, "hash");
      const body = {
        newPassword: "password2",
        newPasswordConfirmation: "password2",
      };
      const mockUpdateById = jest
        .spyOn(userQueries, "updateById")
        .mockResolvedValue(user)
        .mockName("updateById");

      const response = await request(app)
        .put(`/api/users/${user.id}`)
        .set("Accept", "application/json")
        .send(body);

      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        user: {
          ...user,
          created_at: user.created_at.toISOString(),
          updated_at: user.updated_at.toISOString(),
        },
      });
      expect(hashSpy).toHaveBeenCalledTimes(1);
      expect(hashSpy).toHaveBeenNthCalledWith(
        1,
        body.newPassword,
        Number(SALT)
      );
      expect(mockUpdateById).toHaveBeenCalledTimes(1);
      expect(mockUpdateById).toHaveBeenCalledWith(user.id, {
        password: expect.any(String),
      });
    });

    describe("validation", () => {
      it("returns 400 status code when 'newPassword' is not equal to 'newPasswordConfirmation'", async () => {
        const app = express();
        app.use(express.json());
        app.put("/api/users/:userId", update_user);
        const body = {
          newPassword: "password1",
          newPasswordConfirmation: "password2",
        };

        const response = await request(app)
          .put(`/api/users/${user.id}`)
          .set("Accept", "application/json")
          .send(body);

        expect(response.headers["content-type"]).toMatch(/json/);
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          errors: [
            {
              location: "body",
              msg: "'newPassword' and 'newPasswordConfirmation' must be equal.",
              path: "newPassword",
              type: "field",
              value: body.newPassword,
            },
          ],
        });
      });

      it("returns 400 status code when 'newPassword' is provided but not 'newPasswordConfirmation'", async () => {
        const app = express();
        app.use(express.json());
        app.put("/api/users/:userId", update_user);
        const body = {
          newPassword: "password1",
        };

        const response = await request(app)
          .put(`/api/users/${user.id}`)
          .set("Accept", "application/json")
          .send(body);

        expect(response.headers["content-type"]).toMatch(/json/);
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          errors: [
            {
              location: "body",
              msg: "'newPassword' requires 'newPasswordConfirmation' to be provided.",
              path: "newPassword",
              type: "field",
              value: body.newPassword,
            },
          ],
        });
      });

      it("returns 400 status code when 'oldPassword' is provided", async () => {
        const app = express();
        app.use(express.json());
        app.put("/api/users/:userId", update_user);
        const body = {
          oldPassword: "password1",
        };

        const response = await request(app)
          .put(`/api/users/${user.id}`)
          .set("Accept", "application/json")
          .send(body);

        expect(response.headers["content-type"]).toMatch(/json/);
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          errors: [
            {
              location: "body",
              msg: "'oldPassword' is not required when the session user is not provided.",
              path: "oldPassword",
              type: "field",
              value: body.oldPassword,
            },
          ],
        });
      });

      it("returns 400 status code when 'newPasswordConfirmation' is provided but not 'newPassword'", async () => {
        const app = express();
        app.use(express.json());
        app.put("/api/users/:userId", update_user);
        const body = {
          newPasswordConfirmation: "password2",
        };

        const response = await request(app)
          .put(`/api/users/${user.id}`)
          .set("Accept", "application/json")
          .send(body);

        expect(response.headers["content-type"]).toMatch(/json/);
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          errors: [
            {
              location: "body",
              msg: "'newPasswordConfirmation' requires 'newPassword' to be provided.",
              path: "newPasswordConfirmation",
              type: "field",
              value: body.newPasswordConfirmation,
            },
          ],
        });
      });

      it("returns 400 status code when the user does provides nothing", async () => {
        const app = express();
        app.use(express.json());
        app.put("/api/users/:userId", update_user);
        const body = {};

        const response = await request(app)
          .put(`/api/users/${user.id}`)
          .set("Accept", "application/json")
          .send(body);

        expect(response.headers["content-type"]).toMatch(/json/);
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          errors: [
            {
              location: "body",
              msg: "Request body should not be empty.",
              path: "",
              type: "field",
              value: {},
            },
          ],
        });
      });
    });
  });
});
