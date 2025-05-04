import express from "express";
import path from "path";
import request from "supertest";

import { update_user } from "../controllers/user_controller";
import { userQueries } from "../db/user_queries";
import { emailDoesNotExist } from "../utils/email_does_not_exist";

jest.mock("../utils/email_does_not_exist", () => ({
  emailDoesNotExist: jest.fn().mockResolvedValue(true),
}));

const userId = 1;
const user = {
  id: userId,
  password: "password",
  email: "bob@protonmail.com",
  confirmed: false,
  created_at: new Date(),
  updated_at: new Date(),
};
const token = "token";

describe("update_user", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls the functions to update password", async () => {
    const app = express();
    app.set("views", path.join(__dirname, "..", "views"));
    app.set("view engine", "ejs");
    app.use(express.json());
    app.post("/api/users/:userId&:token", update_user);
    const mockUpdateById = jest
      .spyOn(userQueries, "updateById")
      .mockResolvedValue(user);
    const body = {
      newPassword: "password2",
      newPasswordConfirmation: "password2",
    };

    const response = await request(app)
      .post(`/api/users/${userId}&${token}`)
      .set("Accept", "text/html")
      .send(body);

    const hasMessage = response.text.includes(
      "You have successfully updated your password!"
    );
    expect(hasMessage).toBe(true);
    expect(response.headers["content-type"]).toMatch(/html/);
    expect(response.status).toBe(200);
    expect(mockUpdateById).toHaveBeenCalledTimes(1);
    expect(mockUpdateById).toHaveBeenCalledWith(user.id, {
      password: expect.any(String),
    });
  });

  it("calls the functions to update email", async () => {
    const app = express();
    app.set("views", path.join(__dirname, "..", "views"));
    app.set("view engine", "ejs");
    app.use(express.json());
    app.post("/api/users/:userId&:token", update_user);
    const body = {
      email: "updated@protonmail.com",
    };
    const mockUpdateById = jest
      .spyOn(userQueries, "updateById")
      .mockResolvedValue({ ...user, email: body.email });

    const response = await request(app)
      .post(`/api/users/${user.id}&${token}`)
      .set("Accept", "text/html")
      .send(body);

    const hasMessage = response.text.includes(
      "You have successfully updated your email!"
    );
    expect(hasMessage).toBe(true);
    expect(response.headers["content-type"]).toMatch(/html/);
    expect(response.status).toBe(200);
    expect(mockUpdateById).toHaveBeenCalledTimes(1);
    expect(mockUpdateById).toHaveBeenNthCalledWith(1, user.id, {
      email: body.email,
    });
    expect(emailDoesNotExist).toHaveBeenCalledTimes(1);
    expect(emailDoesNotExist).toHaveBeenCalledWith(body.email);
  });

  it("calls the functions to update password only when email and passwords are provided", async () => {
    const app = express();
    app.set("views", path.join(__dirname, "..", "views"));
    app.set("view engine", "ejs");
    app.use(express.json());
    app.post("/api/users/:userId&:token", update_user);
    const body = {
      email: "updated@protonmail.com",
      newPassword: "password2",
      newPasswordConfirmation: "password2",
    };
    const mockUpdateById = jest
      .spyOn(userQueries, "updateById")
      .mockResolvedValue(user);

    const response = await request(app)
      .post(`/api/users/${user.id}&${token}`)
      .set("Accept", "text/html")
      .send(body);

    const hasMessage = response.text.includes(
      "You have successfully updated your password!"
    );
    expect(hasMessage).toBe(true);
    expect(response.headers["content-type"]).toMatch(/html/);
    expect(response.status).toBe(200);
    expect(mockUpdateById).toHaveBeenCalledTimes(1);
    expect(mockUpdateById).toHaveBeenNthCalledWith(1, user.id, {
      password: expect.any(String),
    });
    expect(emailDoesNotExist).toHaveBeenCalledTimes(1);
    expect(emailDoesNotExist).toHaveBeenCalledWith(body.email);
  });

  describe("validation", () => {
    describe("updating email", () => {
      it("returns error page when updating the user email fails", async () => {
        const app = express();
        app.set("views", path.join(__dirname, "..", "views"));
        app.set("view engine", "ejs");
        app.use(express.json());
        app.post("/api/users/:userId&:token", update_user);
        const body = {
          email: "updated@protonmail.com",
        };
        const errorMessage = "cannot update email";
        const mockUpdateById = jest
          .spyOn(userQueries, "updateById")
          .mockImplementation(async () => {
            throw new Error(errorMessage);
          });

        const response = await request(app)
          .post(`/api/users/${user.id}&${token}`)
          .set("Accept", "text/html")
          .send(body);

        const hasMessage = response.text.includes(
          `Unable to change your email. Error: ${errorMessage}. Please try again.`
        );
        expect(hasMessage).toBe(true);
        expect(response.headers["content-type"]).toMatch(/html/);
        expect(response.status).toBe(200);
        expect(mockUpdateById).toHaveBeenCalledTimes(1);
        expect(mockUpdateById).toHaveBeenNthCalledWith(1, user.id, {
          email: body.email,
        });
        expect(emailDoesNotExist).toHaveBeenCalledTimes(1);
        expect(emailDoesNotExist).toHaveBeenCalledWith(body.email);
      });

      it("returns error page with errors when the email is not a valid email", async () => {
        const app = express();
        app.set("views", path.join(__dirname, "..", "views"));
        app.set("view engine", "ejs");
        app.use(express.json());
        app.post("/api/users/:userId&:token", update_user);
        const body = {
          email: "email",
        };

        const response = await request(app)
          .post(`/api/users/${user.id}&${token}`)
          .set("Accept", "text/html")
          .send(body);

        const errors = [
          {
            location: "body",
            msg: "email must be a valid email.",
            path: "email",
            type: "field",
            value: "email",
          },
        ];
        expect(response.headers["content-type"]).toMatch(/html/);
        expect(response.status).toBe(200);
        expect(
          errors.every((error) => {
            return response.text.includes(error.msg);
          })
        ).toBe(true);
        expect(emailDoesNotExist).not.toHaveBeenCalled();
      });

      it("returns error page with errors when the email is greater than 255 characters", async () => {
        const app = express();
        app.set("views", path.join(__dirname, "..", "views"));
        app.set("view engine", "ejs");
        app.use(express.json());
        app.post("/api/users/:userId&:token", update_user);
        const email = new Array(256).fill("a").join("") + "@protonmail.com";
        const body = {
          email,
        };

        const response = await request(app)
          .post(`/api/users/${user.id}&${token}`)
          .set("Accept", "text/html")
          .send(body);

        const errors = [
          {
            location: "body",
            msg: "email cannot be greater than 255 characters.",
            path: "email",
            type: "field",
            value: email,
          },
        ];
        expect(response.headers["content-type"]).toMatch(/html/);
        expect(response.status).toBe(200);
        expect(
          errors.every((error) => {
            return response.text.includes(error.msg);
          })
        ).toBe(true);
        expect(emailDoesNotExist).not.toHaveBeenCalled();
      });
    });

    describe("updating password", () => {
      it("returns error page when updating the user password fails", async () => {
        const app = express();
        app.set("views", path.join(__dirname, "..", "views"));
        app.set("view engine", "ejs");
        app.use(express.json());
        app.post("/api/users/:userId&:token", update_user);
        const body = {
          newPassword: "password2",
          newPasswordConfirmation: "password2",
        };
        const errorMessage = "cannot update password";
        const mockUpdateById = jest
          .spyOn(userQueries, "updateById")
          .mockImplementation(async () => {
            throw new Error(errorMessage);
          });

        const response = await request(app)
          .post(`/api/users/${user.id}&${token}`)
          .set("Accept", "text/html")
          .send(body);

        const hasMessage = response.text.includes(
          `Unable to change your password. Error: ${errorMessage}. Please try again.`
        );
        expect(hasMessage).toBe(true);
        expect(response.headers["content-type"]).toMatch(/html/);
        expect(response.status).toBe(200);
        expect(mockUpdateById).toHaveBeenCalledTimes(1);
        expect(mockUpdateById).toHaveBeenNthCalledWith(1, user.id, {
          password: expect.any(String),
        });
      });

      it("returns error page with errors when 'newPassword' and 'newPasswordConfirmation' are not equal", async () => {
        const app = express();
        app.set("views", path.join(__dirname, "..", "views"));
        app.set("view engine", "ejs");
        app.use(express.json());
        app.post("/api/users/:userId&:token", update_user);
        const body = {
          newPassword: "password3",
          newPasswordConfirmation: "password2",
        };

        const response = await request(app)
          .post(`/api/users/${user.id}&${token}`)
          .set("Accept", "text/html")
          .send(body);

        const errors = [
          {
            location: "body",
            msg: "newPassword and newPasswordConfirmation must be equal.",
            path: "newPassword",
            type: "field",
            value: body.newPassword,
          },
        ];
        expect(response.headers["content-type"]).toMatch(/html/);
        expect(response.status).toBe(200);
        expect(
          errors.every((error) => {
            return response.text.includes(error.msg);
          })
        ).toBe(true);
      });

      it("returns error page with errors when 'newPasswordConfirmation' is provided but is not 'newPassword'", async () => {
        const app = express();
        app.set("views", path.join(__dirname, "..", "views"));
        app.set("view engine", "ejs");
        app.use(express.json());
        app.post("/api/users/:userId&:token", update_user);
        const body = {
          newPasswordConfirmation: "password1",
        };

        const response = await request(app)
          .post(`/api/users/${user.id}&${token}`)
          .set("Accept", "text/html")
          .send(body);

        const errors = [
          {
            location: "body",
            msg: "newPasswordConfirmation requires newPassword to be provided.",
            path: "newPasswordConfirmation",
            type: "field",
            value: body.newPasswordConfirmation,
          },
        ];
        expect(response.headers["content-type"]).toMatch(/html/);
        expect(response.status).toBe(200);
        expect(
          errors.every((error) => {
            return response.text.includes(error.msg);
          })
        ).toBe(true);
      });

      it("returns error page with errors when 'newPassword' is provided but 'newPasswordConfirmation' is not", async () => {
        const app = express();
        app.set("views", path.join(__dirname, "..", "views"));
        app.set("view engine", "ejs");
        app.use(express.json());
        app.post("/api/users/:userId&:token", update_user);
        const body = {
          newPassword: "password1",
        };

        const response = await request(app)
          .post(`/api/users/${user.id}&${token}`)
          .set("Accept", "text/html")
          .send(body);

        const errors = [
          {
            location: "body",
            msg: "newPassword requires newPasswordConfirmation to be provided.",
            path: "newPassword",
            type: "field",
            value: body.newPassword,
          },
        ];
        expect(response.headers["content-type"]).toMatch(/html/);
        expect(response.status).toBe(200);
        expect(
          errors.every((error) => {
            return response.text.includes(error.msg);
          })
        ).toBe(true);
      });

      it("returns error page with errors when 'newPassword' is greater than 72 characters", async () => {
        const app = express();
        app.set("views", path.join(__dirname, "..", "views"));
        app.set("view engine", "ejs");
        app.use(express.json());
        app.post("/api/users/:userId&:token", update_user);
        const password = new Array(73).fill("a").join("");
        const body = {
          newPassword: password,
          newPasswordConfirmation: password,
        };

        const response = await request(app)
          .post(`/api/users/${user.id}&${token}`)
          .set("Accept", "text/html")
          .send(body);

        const errors = [
          {
            location: "body",
            msg: "newPassword cannot be greater than 72 characters.",
            path: "newPassword",
            type: "field",
            value: password,
          },
          {
            location: "body",
            msg: "newPasswordConfirmation cannot be greater than 72 characters.",
            path: "newPasswordConfirmation",
            type: "field",
            value: password,
          },
        ];
        expect(response.headers["content-type"]).toMatch(/html/);
        expect(response.status).toBe(200);
        expect(
          errors.every((error) => {
            return response.text.includes(error.msg);
          })
        ).toBe(true);
      });

      it("returns error page with errors when 'newPasswordConfirmation' is greater than 72 characters", async () => {
        const app = express();
        app.set("views", path.join(__dirname, "..", "views"));
        app.set("view engine", "ejs");
        app.use(express.json());
        app.post("/api/users/:userId&:token", update_user);
        const password = new Array(73).fill("a").join("");
        const body = {
          newPassword: "password",
          newPasswordConfirmation: password,
        };

        const response = await request(app)
          .post(`/api/users/${user.id}&${token}`)
          .set("Accept", "text/html")
          .send(body);

        const errors = [
          {
            location: "body",
            msg: "newPassword and newPasswordConfirmation must be equal.",
            path: "newPassword",
            type: "field",
            value: body.newPassword,
          },
          {
            location: "body",
            msg: "newPasswordConfirmation cannot be greater than 72 characters.",
            path: "newPasswordConfirmation",
            type: "field",
            value: password,
          },
        ];
        expect(response.headers["content-type"]).toMatch(/html/);
        expect(response.status).toBe(200);
        expect(
          errors.every((error) => {
            return response.text.includes(error.msg);
          })
        ).toBe(true);
      });
    });

    it("returns error page with errors when the user does provides nothing", async () => {
      const app = express();
      app.set("views", path.join(__dirname, "..", "views"));
      app.set("view engine", "ejs");
      app.use(express.json());
      app.post("/api/users/:userId&:token", update_user);
      const body = {};

      const response = await request(app)
        .post(`/api/users/${user.id}&${token}`)
        .set("Accept", "text/html")
        .send(body);

      const errors = [
        {
          location: "body",
          msg: "Request body should not be empty.",
          path: "",
          type: "field",
          value: {},
        },
      ];
      expect(response.headers["content-type"]).toMatch(/html/);
      expect(response.status).toBe(200);
      expect(
        errors.every((error) => {
          return response.text.includes(error.msg);
        })
      ).toBe(true);
    });
  });
});
