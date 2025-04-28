import bcrypt from "bcryptjs";
import express from "express";
import path from "path";
import request from "supertest";

import { variables } from "../config/variables";
import { update_user } from "../controllers/user_controller";
import { userQueries } from "../db/user_queries";
import { emailDoesNotExist } from "../utils/email_does_not_exist";

const { SALT } = variables;

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
    const mockUserQueriesGet = jest
      .spyOn(userQueries, "getByIdWithPassword")
      .mockResolvedValue(user);
    const mockCompare = jest
      .spyOn(bcrypt, "compare")
      .mockImplementation(async () => {
        return true;
      });
    const body = {
      oldPassword: "correctPassword",
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
    expect(mockUserQueriesGet).toHaveBeenCalledTimes(1);
    expect(mockUserQueriesGet).toHaveBeenCalledWith(user.id);
    expect(mockCompare).toHaveBeenCalledTimes(1);
    expect(mockCompare).toHaveBeenCalledWith(body.oldPassword, user.password);
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
    const mockUserQueriesGet = jest
      .spyOn(userQueries, "getByIdWithPassword")
      .mockResolvedValue(user);
    const mockCompare = jest
      .spyOn(bcrypt, "compare")
      .mockImplementation(async () => {
        return true;
      });
    const body = {
      email: "updated@protonmail.com",
      oldPassword: "password1",
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
    expect(mockUserQueriesGet).toHaveBeenCalledTimes(1);
    expect(mockUserQueriesGet).toHaveBeenCalledWith(user.id);
    expect(mockCompare).toHaveBeenCalledTimes(1);
    expect(mockCompare).toHaveBeenCalledWith(body.oldPassword, user.password);
    expect(mockUpdateById).toHaveBeenCalledTimes(1);
    expect(mockUpdateById).toHaveBeenNthCalledWith(1, user.id, {
      email: body.email,
    });
    expect(emailDoesNotExist).toHaveBeenCalledTimes(1);
    expect(emailDoesNotExist).toHaveBeenCalledWith(body.email);
  });

  it("calls the functions to update email only when email and passwords are provided", async () => {
    const app = express();
    app.set("views", path.join(__dirname, "..", "views"));
    app.set("view engine", "ejs");
    app.use(express.json());
    app.post("/api/users/:userId&:token", update_user);
    const mockUserQueriesGet = jest
      .spyOn(userQueries, "getByIdWithPassword")
      .mockResolvedValue(user);
    const mockCompare = jest
      .spyOn(bcrypt, "compare")
      .mockImplementation(async () => {
        return true;
      });
    const body = {
      email: "updated@protonmail.com",
      oldPassword: "password1",
      newPassword: "password2",
      newPasswordConfirmation: "password2",
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
    expect(mockUserQueriesGet).toHaveBeenCalledTimes(1);
    expect(mockUserQueriesGet).toHaveBeenCalledWith(user.id);
    expect(mockCompare).toHaveBeenCalledTimes(1);
    expect(mockCompare).toHaveBeenCalledWith(body.oldPassword, user.password);
    expect(mockUpdateById).toHaveBeenCalledTimes(1);
    expect(mockUpdateById).toHaveBeenNthCalledWith(1, user.id, {
      email: body.email,
    });
    expect(emailDoesNotExist).toHaveBeenCalledTimes(1);
    expect(emailDoesNotExist).toHaveBeenCalledWith(body.email);
  });

  describe("validation", () => {
    describe("updating email", () => {
      it("returns error page with errors when the oldPassword is incorrect", async () => {
        const app = express();
        app.set("views", path.join(__dirname, "..", "views"));
        app.set("view engine", "ejs");
        app.use(express.json());
        app.post("/api/users/:userId&:token", update_user);
        const mockUserQueriesGet = jest
          .spyOn(userQueries, "getByIdWithPassword")
          .mockResolvedValue(user);
        const mockCompare = jest
          .spyOn(bcrypt, "compare")
          .mockImplementation(async () => {
            return false;
          });
        const body = {
          email: user.email,
          oldPassword: "password2",
        };

        const response = await request(app)
          .post(`/api/users/${user.id}&${token}`)
          .set("Accept", "text/html")
          .send(body);

        const hasMessage = response.text.includes(
          "You typed your old password incorrectly. Try again."
        );
        expect(hasMessage).toBe(true);
        expect(response.headers["content-type"]).toMatch(/html/);
        expect(response.status).toBe(200);
        expect(mockUserQueriesGet).toHaveBeenCalledTimes(1);
        expect(mockUserQueriesGet).toHaveBeenCalledWith(user.id);
        expect(mockCompare).toHaveBeenCalledTimes(1);
        expect(mockCompare).toHaveBeenCalledWith(
          body.oldPassword,
          user.password
        );
      });

      it("returns error page with errors when 'email' and 'newPassword' is provided but 'oldPassword' and 'newPasswordConfirmation' is not", async () => {
        const app = express();
        app.set("views", path.join(__dirname, "..", "views"));
        app.set("view engine", "ejs");
        app.use(express.json());
        app.post("/api/users/:userId&:token", update_user);
        const body = {
          email: user.email,
          newPassword: "password1",
        };

        const response = await request(app)
          .post(`/api/users/${user.id}&${token}`)
          .set("Accept", "text/html")
          .send(body);

        const errors = [
          {
            location: "body",
            msg: "oldPassword is required when updating email.",
            path: "email",
            type: "field",
            value: body.email,
          },
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
        expect(emailDoesNotExist).toHaveBeenCalledTimes(1);
        expect(emailDoesNotExist).toHaveBeenCalledWith(body.email);
      });

      it("returns error page with errors when 'email' and 'newPasswordConfirmation' is provided but 'oldPassword' and 'newPasswordConfirmation' is not", async () => {
        const app = express();
        app.set("views", path.join(__dirname, "..", "views"));
        app.set("view engine", "ejs");
        app.use(express.json());
        app.post("/api/users/:userId&:token", update_user);
        const body = {
          email: user.email,
          newPasswordConfirmation: "password1",
        };

        const response = await request(app)
          .post(`/api/users/${user.id}&${token}`)
          .set("Accept", "text/html")
          .send(body);

        const errors = [
          {
            location: "body",
            msg: "oldPassword is required when updating email.",
            path: "email",
            type: "field",
            value: body.email,
          },
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
        expect(emailDoesNotExist).toHaveBeenCalledTimes(1);
        expect(emailDoesNotExist).toHaveBeenCalledWith(body.email);
      });

      it("returns error page with errors when 'email', 'newPassword' and 'newPasswordConfirmation' is provided but 'oldPassword' is not", async () => {
        const app = express();
        app.set("views", path.join(__dirname, "..", "views"));
        app.set("view engine", "ejs");
        app.use(express.json());
        app.post("/api/users/:userId&:token", update_user);
        const body = {
          email: user.email,
          newPassword: "password1",
          newPasswordConfirmation: "password1",
        };

        const response = await request(app)
          .post(`/api/users/${user.id}&${token}`)
          .set("Accept", "text/html")
          .send(body);

        const errors = [
          {
            location: "body",
            msg: "oldPassword is required when updating email.",
            path: "email",
            type: "field",
            value: body.email,
          },
          {
            location: "body",
            msg: "oldPassword is required when updating password.",
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
        expect(emailDoesNotExist).toHaveBeenCalledTimes(1);
        expect(emailDoesNotExist).toHaveBeenCalledWith(body.email);
      });

      it("returns error page with errors when 'email', 'oldPassword' and 'newPasswordConfirmation' is provided but 'newPassword' is not", async () => {
        const app = express();
        app.set("views", path.join(__dirname, "..", "views"));
        app.set("view engine", "ejs");
        app.use(express.json());
        app.post("/api/users/:userId&:token", update_user);
        const body = {
          email: user.email,
          oldPassword: "password1",
          newPasswordConfirmation: "password2",
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
            value: "password2",
          },
        ];
        expect(response.headers["content-type"]).toMatch(/html/);
        expect(response.status).toBe(200);
        expect(
          errors.every((error) => {
            return response.text.includes(error.msg);
          })
        ).toBe(true);
        expect(emailDoesNotExist).toHaveBeenCalledTimes(1);
        expect(emailDoesNotExist).toHaveBeenCalledWith(body.email);
      });

      it("returns error page with errors when 'email', 'oldPassword' and 'newPassword' is provided but 'newPasswordConfirmation' is not", async () => {
        const app = express();
        app.set("views", path.join(__dirname, "..", "views"));
        app.set("view engine", "ejs");
        app.use(express.json());
        app.post("/api/users/:userId&:token", update_user);
        const body = {
          email: user.email,
          oldPassword: "password1",
          newPassword: "password2",
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
          oldPassword: "password",
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
          oldPassword: "password",
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
      it("returns error page with errors when the oldPassword is incorrect", async () => {
        const app = express();
        app.set("views", path.join(__dirname, "..", "views"));
        app.set("view engine", "ejs");
        app.use(express.json());
        app.post("/api/users/:userId&:token", update_user);
        const mockUserQueriesGet = jest
          .spyOn(userQueries, "getByIdWithPassword")
          .mockResolvedValue(user);
        const mockCompare = jest
          .spyOn(bcrypt, "compare")
          .mockImplementation(async () => {
            return false;
          });
        const body = {
          oldPassword: "wrongPassword",
          newPassword: "password2",
          newPasswordConfirmation: "password2",
        };

        const response = await request(app)
          .post(`/api/users/${user.id}&${token}`)
          .set("Accept", "text/html")
          .send(body);

        const hasMessage = response.text.includes(
          "You typed your old password incorrectly. Try again."
        );
        expect(hasMessage).toBe(true);
        expect(response.headers["content-type"]).toMatch(/html/);
        expect(response.status).toBe(200);
        expect(mockUserQueriesGet).toHaveBeenCalledTimes(1);
        expect(mockUserQueriesGet).toHaveBeenCalledWith(user.id);
        expect(mockCompare).toHaveBeenCalledTimes(1);
        expect(mockCompare).toHaveBeenCalledWith(
          body.oldPassword,
          user.password
        );
      });

      it("returns error page with errors when 'newPassword' and 'newPasswordConfirmation' are not equal", async () => {
        const app = express();
        app.set("views", path.join(__dirname, "..", "views"));
        app.set("view engine", "ejs");
        app.use(express.json());
        app.post("/api/users/:userId&:token", update_user);
        const body = {
          oldPassword: "password1",
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

      it("returns error page with errors when 'newPasswordConfirmation' is provided but 'newPassword' and 'oldPassword' is not", async () => {
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

      it("returns error page with errors when 'newPassword' is provided but 'newPasswordConfirmation' and 'oldPassword' is not", async () => {
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

      it("returns error page with errors when 'oldPassword' is provided but 'newPassword' and 'newPasswordConfirmation' is not", async () => {
        const app = express();
        app.set("views", path.join(__dirname, "..", "views"));
        app.set("view engine", "ejs");
        app.use(express.json());
        app.post("/api/users/:userId&:token", update_user);
        const body = {
          oldPassword: "password1",
        };

        const response = await request(app)
          .post(`/api/users/${user.id}&${token}`)
          .set("Accept", "text/html")
          .send(body);

        const errors = [
          {
            location: "body",
            msg: "oldPassword requires email or newPassword and newPasswordConfirmation to be provided.",
            path: "oldPassword",
            type: "field",
            value: body.oldPassword,
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

      it("returns error page with errors when 'oldPassword' and 'newPassword' is provided but 'newPasswordConfirmation' is not", async () => {
        const app = express();
        app.set("views", path.join(__dirname, "..", "views"));
        app.set("view engine", "ejs");
        app.use(express.json());
        app.post("/api/users/:userId&:token", update_user);
        const body = {
          oldPassword: "password1",
          newPassword: "password2",
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

      it("returns error page with errors when 'oldPassword' and 'newPasswordConfirmation' is provided but 'newPassword' is not", async () => {
        const app = express();
        app.set("views", path.join(__dirname, "..", "views"));
        app.set("view engine", "ejs");
        app.use(express.json());
        app.post("/api/users/:userId&:token", update_user);
        const body = {
          oldPassword: "password1",
          newPasswordConfirmation: "password2",
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

      it("returns error page with errors when 'newPassword' and 'newPasswordConfirmation' is provided but 'oldPassword' is not", async () => {
        const app = express();
        app.set("views", path.join(__dirname, "..", "views"));
        app.set("view engine", "ejs");
        app.use(express.json());
        app.post("/api/users/:userId&:token", update_user);
        const body = {
          newPassword: "password2",
          newPasswordConfirmation: "password2",
        };

        const response = await request(app)
          .post(`/api/users/${user.id}&${token}`)
          .set("Accept", "text/html")
          .send(body);

        const errors = [
          {
            location: "body",
            msg: "oldPassword is required when updating password.",
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
          oldPassword: "password",
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
          oldPassword: "password",
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
            value: body.oldPassword,
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
