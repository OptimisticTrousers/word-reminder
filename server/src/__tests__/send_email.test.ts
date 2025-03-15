import ejs from "ejs";
import express from "express";
import { SentMessageInfo } from "nodemailer";
import { readFile } from "node:fs/promises";
import path from "path";
import { Job } from "pg-boss";
import request from "supertest";

import { send_email } from "../controllers/email_controller";
import { boss } from "../db/boss";
import { tokenQueries } from "../db/token_queries";
import { email } from "../utils/email";
import { Subject, Template } from "common";
import { userQueries } from "../db/user_queries";

const userId = 1;
const user = {
  id: userId,
  email: "bob@gmail.com",
  confirmed: true,
  created_at: new Date(),
  updated_at: new Date(),
};
const queueName = `${userId}-email-queue`;

const app = express();
app.use(express.json());
app.post("/api/users/:userId/emails", send_email);

const info: SentMessageInfo = {
  message: "Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email",
};

const token = {
  token: "token",
  expires_at: new Date(),
};

const mockSend = jest.spyOn(email, "sendMail").mockResolvedValue(info);

const mockCreate = jest.spyOn(tokenQueries, "create").mockResolvedValue(token);

const mockSendAfter = jest
  .spyOn(boss, "sendAfter")
  .mockImplementation(jest.fn());

let capturedCallback: any;

const mockWork = jest
  .spyOn(boss, "work")
  .mockImplementation(async (queueName, callback) => {
    capturedCallback = callback; // Capture the callback
    return "";
  });

const mockDeleteAll = jest
  .spyOn(tokenQueries, "deleteAll")
  .mockImplementation(jest.fn());

const mockJobs = [
  { data: { token: "token1" } },
  { data: { token: "token2" } },
] as unknown as Job<{ token: string }>[];

jest.spyOn(global.Date, "now").mockImplementation(() => {
  return new Date(0).valueOf();
});
const ms = 30 * 60 * 1000; // 30 minutes in ms

describe("send_email", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 400 status code when the 'email' is not provided", async () => {
    const body = {
      email: undefined,
      template: Template.CHANGE_EMAIL,
      subject: Subject.CHANGE_EMAIL,
    };
    const response = await request(app)
      .post(`/api/users/${userId}/emails`)
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
      ],
    });
  });

  it("returns 400 status code when the 'subject' is not provided", async () => {
    const body = {
      email: user.email,
      template: Template.CHANGE_PASSWORD,
      subject: undefined,
    };

    const response = await request(app)
      .post(`/api/users/${userId}/emails`)
      .set("Accept", "application/json")
      .send(body);

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      errors: [
        {
          location: "body",
          msg: "'subject' must be specified.",
          path: "subject",
          type: "field",
        },
      ],
    });
  });

  it("returns 400 status code when the 'template' is not provided", async () => {
    const body = {
      email: user.email,
      template: undefined,
      subject: Subject.CHANGE_PASSWORD,
    };

    const response = await request(app)
      .post(`/api/users/${userId}/emails`)
      .set("Accept", "application/json")
      .send(body);

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      errors: [
        {
          location: "body",
          msg: "'template' must be specified.",
          path: "template",
          type: "field",
        },
      ],
    });
  });

  it("returns 400 status code when the 'template' is not in the 'Template' enum", async () => {
    const body = {
      email: user.email,
      template: "invalid-template",
      subject: Subject.CHANGE_PASSWORD,
    };

    const response = await request(app)
      .post(`/api/users/${userId}/emails`)
      .set("Accept", "application/json")
      .send(body);

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      errors: [
        {
          location: "body",
          msg: `'template' must be a value in this enum: ${Object.values(
            Template
          )}.`,
          path: "template",
          type: "field",
          value: body.template,
        },
      ],
    });
  });

  it("returns 400 status code when the 'subject' is not in the 'Subject' enum", async () => {
    const body = {
      email: user.email,
      template: Template.FORGOT_PASSWORD,
      subject: "invalid-subject",
    };

    const response = await request(app)
      .post(`/api/users/${userId}/emails`)
      .set("Accept", "application/json")
      .send(body);

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      errors: [
        {
          location: "body",
          msg: `'subject' must be a value in this enum: ${Object.values(
            Subject
          )}.`,
          path: "subject",
          type: "field",
          value: body.subject,
        },
      ],
    });
  });

  it("returns 400 status code when the email is not a valid email", async () => {
    const body = {
      email: "email",
      template: Template.CONFIRM_ACCOUNT,
      subject: Subject.CONFIRM_ACCOUNT,
    };

    const response = await request(app)
      .post(`/api/users/${userId}/emails`)
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

  it("calls the functions to send email with 'confirm_account' template", async () => {
    const body = {
      email: user.email,
      template: Template.CONFIRM_ACCOUNT,
      subject: Subject.CONFIRM_ACCOUNT,
    };
    const emailTemplate = await readFile(
      path.join(__dirname, "..", "views", "emails", `${body.template}.ejs`),
      "utf-8"
    );

    const response = await request(app)
      .post(`/api/users/${userId}/emails`)
      .set("Accept", "application/json")
      .send(body);
    await capturedCallback(mockJobs);

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ info });
    expect(mockCreate).toHaveBeenCalledTimes(1);
    expect(mockCreate).toHaveBeenCalledWith();
    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(mockSend).toHaveBeenCalledWith({
      html: ejs.render(emailTemplate, {
        url: `/${body.template}/${userId}&${token.token}`,
      }),
      subject: body.subject,
      to: body.email,
    });
    expect(mockSendAfter).toHaveBeenCalledTimes(1);
    expect(mockSendAfter).toHaveBeenCalledWith(
      queueName,
      { token },
      {},
      new Date(ms)
    );
    expect(mockWork).toHaveBeenCalledTimes(1);
    expect(mockWork).toHaveBeenCalledWith(queueName, capturedCallback);
    expect(mockDeleteAll).toHaveBeenCalledTimes(1);
    expect(mockDeleteAll).toHaveBeenCalledWith(["token1", "token2"]);
  });

  it("calls the functions to send email with 'change_password' template", async () => {
    const body = {
      email: user.email,
      template: Template.CHANGE_PASSWORD,
      subject: Subject.CHANGE_PASSWORD,
    };
    const emailTemplate = await readFile(
      path.join(__dirname, "..", "views", "emails", `${body.template}.ejs`),
      "utf-8"
    );

    const response = await request(app)
      .post(`/api/users/${userId}/emails`)
      .set("Accept", "application/json")
      .send(body);
    await capturedCallback(mockJobs);

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ info });
    expect(mockCreate).toHaveBeenCalledTimes(1);
    expect(mockCreate).toHaveBeenCalledWith();
    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(mockSend).toHaveBeenCalledWith({
      html: ejs.render(emailTemplate, {
        url: `/${body.template}/${userId}&${token.token}`,
      }),
      subject: body.subject,
      to: body.email,
    });
    expect(mockSendAfter).toHaveBeenCalledTimes(1);
    expect(mockSendAfter).toHaveBeenCalledWith(
      queueName,
      { token },
      {},
      new Date(ms)
    );
    expect(mockWork).toHaveBeenCalledTimes(1);
    expect(mockWork).toHaveBeenCalledWith(queueName, capturedCallback);
    expect(mockDeleteAll).toHaveBeenCalledTimes(1);
    expect(mockDeleteAll).toHaveBeenCalledWith(["token1", "token2"]);
  });

  it("calls the functions to send email with 'change_email' template", async () => {
    const body = {
      email: user.email,
      template: Template.CHANGE_EMAIL,
      subject: Subject.CHANGE_EMAIL,
    };
    const emailTemplate = await readFile(
      path.join(__dirname, "..", "views", "emails", `${body.template}.ejs`),
      "utf-8"
    );

    const response = await request(app)
      .post(`/api/users/${userId}/emails`)
      .set("Accept", "application/json")
      .send(body);
    await capturedCallback(mockJobs);

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ info });
    expect(mockCreate).toHaveBeenCalledTimes(1);
    expect(mockCreate).toHaveBeenCalledWith();
    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(mockSend).toHaveBeenCalledWith({
      html: ejs.render(emailTemplate, {
        url: `/${body.template}/${userId}&${token.token}`,
      }),
      subject: body.subject,
      to: body.email,
    });
    expect(mockSendAfter).toHaveBeenCalledTimes(1);
    expect(mockSendAfter).toHaveBeenCalledWith(
      queueName,
      { token },
      {},
      new Date(ms)
    );
    expect(mockWork).toHaveBeenCalledTimes(1);
    expect(mockWork).toHaveBeenCalledWith(queueName, capturedCallback);
    expect(mockDeleteAll).toHaveBeenCalledTimes(1);
    expect(mockDeleteAll).toHaveBeenCalledWith(["token1", "token2"]);
  });

  it("calls the functions to send email with 'forgot_password' template when userId is undefined", async () => {
    const body = {
      email: user.email,
      template: Template.FORGOT_PASSWORD,
      subject: Subject.FORGOT_PASSWORD,
    };
    const emailTemplate = await readFile(
      path.join(__dirname, "..", "views", "emails", `${body.template}.ejs`),
      "utf-8"
    );
    const mockGetByEmail = jest
      .spyOn(userQueries, "getByEmail")
      .mockResolvedValue(user);

    const response = await request(app)
      .post(`/api/users/${undefined}/emails`)
      .set("Accept", "application/json")
      .send(body);
    await capturedCallback(mockJobs);

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ info });
    expect(mockGetByEmail).toHaveBeenCalledTimes(1);
    expect(mockGetByEmail).toHaveBeenCalledWith(user.email);
    expect(mockCreate).toHaveBeenCalledTimes(1);
    expect(mockCreate).toHaveBeenCalledWith();
    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(mockSend).toHaveBeenCalledWith({
      html: ejs.render(emailTemplate, {
        url: `/${body.template}/${userId}&${token.token}`,
      }),
      subject: body.subject,
      to: body.email,
    });
    expect(mockSendAfter).toHaveBeenCalledTimes(1);
    expect(mockSendAfter).toHaveBeenCalledWith(
      queueName,
      { token },
      {},
      new Date(ms)
    );
    expect(mockWork).toHaveBeenCalledTimes(1);
    expect(mockWork).toHaveBeenCalledWith(queueName, capturedCallback);
    expect(mockDeleteAll).toHaveBeenCalledTimes(1);
    expect(mockDeleteAll).toHaveBeenCalledWith(["token1", "token2"]);
  });
});
