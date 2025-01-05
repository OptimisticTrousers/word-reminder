import bcrypt from "bcryptjs";
import express from "express";
import request from "supertest";

import { variables } from "../config/variables";
import { update_user } from "../controllers/user_controller";
import { UserQueries } from "../db/user_queries";
import { emailExists } from "../utils/email_exists";

const { SALT } = variables;

jest.mock("../utils/email_exists", () => ({
  emailExists: jest.fn().mockResolvedValue(true),
}));

describe("update_user", () => {
  const app = express();
  app.use(express.json());
  app.put("/api/users/:userId", update_user);

  const user = {
    id: "1",
    email: "bob@protonmail.com",
    confirmed: false,
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 400 status code when the oldPassword is incorrect", async () => {
    const hashSpy = jest.spyOn(bcrypt, "hash");
    const mockUserQueriesGet = jest
      .spyOn(UserQueries.prototype, "get")
      .mockResolvedValue(undefined)
      .mockName("get");

    const body = {
      email: user.email,
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
      email: body.email,
      password: expect.any(String),
    });
    expect(hashSpy).toHaveBeenCalledTimes(1);
    expect(hashSpy).toHaveBeenCalledWith(body.oldPassword, Number(SALT));
    expect(emailExists).toHaveBeenCalledTimes(1);
  });

  it("calls the functions to update password", async () => {
    const hashSpy = jest.spyOn(bcrypt, "hash");
    const mockUserQueriesGet = jest
      .spyOn(UserQueries.prototype, "get")
      .mockResolvedValue(user)
      .mockName("get");

    const body = {
      email: user.email,
      oldPassword: "correctPassword",
      newPassword: "password2",
      newPasswordConfirmation: "password2",
    };

    const mockUpdateById = jest
      .spyOn(UserQueries.prototype, "updateById")
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
    expect(mockUserQueriesGet).toHaveBeenCalledTimes(1);
    expect(mockUserQueriesGet).toHaveBeenCalledWith({
      email: body.email,
      password: expect.any(String),
    });
    expect(hashSpy).toHaveBeenCalledTimes(2);
    expect(hashSpy).toHaveBeenNthCalledWith(1, body.oldPassword, Number(SALT));
    expect(hashSpy).toHaveBeenNthCalledWith(2, body.newPassword, Number(SALT));
    expect(mockUpdateById).toHaveBeenCalledTimes(1);
    expect(mockUpdateById).toHaveBeenCalledWith(user.id, {
      password: expect.any(String),
    });
    expect(emailExists).toHaveBeenCalledTimes(1);
  });

  it("calls the functions to update email", async () => {
    const hashSpy = jest.spyOn(bcrypt, "hash");
    const mockUserQueriesGet = jest
      .spyOn(UserQueries.prototype, "get")
      .mockResolvedValue(user)
      .mockName("get");
    const body = {
      email: "updated@protonmail.com",
      oldPassword: "password1",
    };
    const mockUpdateById = jest
      .spyOn(UserQueries.prototype, "updateById")
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
      email: body.email,
      password: expect.any(String),
    });
    expect(mockUpdateById).toHaveBeenCalledTimes(1);
    expect(mockUpdateById).toHaveBeenNthCalledWith(1, user.id, {
      email: body.email,
    });
    expect(emailExists).toHaveBeenCalledTimes(1);
  });

  it("returns 400 status code when the user does provides nothing", async () => {
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
          msg: "'email' must be specified.",
          path: "email",
          type: "field",
          value: "",
        },
        {
          location: "body",
          msg: "'oldPassword' must be specified.",
          path: "oldPassword",
          type: "field",
          value: "",
        },
      ],
    });
  });

  it("returns 400 status code when 'email' and 'newPassword' is provided but 'oldPassword' and 'newPasswordConfirmation' is not", async () => {
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
          msg: "'oldPassword' must be specified.",
          path: "oldPassword",
          type: "field",
          value: "",
        },
        {
          location: "body",
          msg: "'newPassword' requires 'newPasswordConfirmation' to be provided.",
          path: "newPassword",
          type: "field",
          value: "password1",
        },
      ],
    });
    expect(emailExists).toHaveBeenCalledTimes(1);
  });

  it("returns 400 status code when 'email' and 'newPasswordConfirmation' is provided but 'oldPassword' and 'newPassword' is not", async () => {
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
          msg: "'oldPassword' must be specified.",
          path: "oldPassword",
          type: "field",
          value: "",
        },
        {
          location: "body",
          msg: "'newPasswordConfirmation' requires 'newPassword' to be provided.",
          path: "newPasswordConfirmation",
          type: "field",
          value: "password1",
        },
      ],
    });
    expect(emailExists).toHaveBeenCalledTimes(1);
  });

  it("returns 400 status code when 'email', 'newPassword' and 'newPasswordConfirmation' are not equal", async () => {
    const body = {
      email: user.email,
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
          path: "newPasswordConfirmation",
          type: "field",
          value: "password2",
        },
      ],
    });
    expect(emailExists).toHaveBeenCalledTimes(1);
  });

  it("returns 400 status code when 'email', 'oldPassword' and 'newPassword' is provided but'newPasswordConfirmation' is not", async () => {
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
          value: "password2",
        },
      ],
    });
    expect(emailExists).toHaveBeenCalledTimes(1);
  });

  it("returns 400 status code when 'email', 'newPassword' and 'newPasswordConfirmation' is provided but 'oldPassword' is not", async () => {
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
          msg: "'oldPassword' must be specified.",
          path: "oldPassword",
          type: "field",
          value: "",
        },
      ],
    });
    expect(emailExists).toHaveBeenCalledTimes(1);
  });

  it("returns 400 status code when 'email', 'oldPassword' and 'newPasswordConfirmation' is provided but 'newPassword' is not", async () => {
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

  it("returns 400 status code when the email is not a valid email", async () => {
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

  it("returns 400 status code when 'newPassword' is greater than 72 characters", async () => {
    const password = new Array(73).fill("a").join("");
    const body = {
      email: user.email,
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
    const password = new Array(73).fill("a").join("");
    const body = {
      email: user.email,
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
          msg: "'newPasswordConfirmation' cannot be greater than 72 characters.",
          path: "newPasswordConfirmation",
          type: "field",
          value: password,
        },
      ],
    });
  });
});
