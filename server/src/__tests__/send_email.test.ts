/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import inlineCss from "inline-css";
import ejs from "ejs";
import express from "express";
import { SentMessageInfo } from "nodemailer";
import { readFile } from "node:fs/promises";
import path from "path";
import request from "supertest";

import { send_email } from "../controllers/email_controller";
import { boss } from "../db/boss";
import { tokenQueries } from "../db/token_queries";
import { email } from "../utils/email";
import { Subject, Template } from "common";
import { variables } from "../config/variables";
import { userQueries } from "../db/user_queries";

const { SERVER_URL } = variables;

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
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
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
      template: Template.CHANGE_PASSWORD,
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
    const emailTemplatePath = path.join(
      process.cwd(),
      "src",
      "views",
      "emails",
      `${body.template}.ejs`
    );
    const emailTemplate = await readFile(emailTemplatePath, "utf-8");
    const publicFolder = path.join(process.cwd(), "src", "public");
    const publicUrl = `file://${publicFolder}/`;
    const html = ejs.render(
      emailTemplate,
      {
        url: `${SERVER_URL}/confirmAccount/${userId}&${token.token}`,
        title: "Confirm Account",
      },
      {
        filename: emailTemplatePath,
      }
    );
    const inlineHTML = await inlineCss(html, {
      url: publicUrl,
      removeLinkTags: true,
    });

    const response = await request(app)
      .post(`/api/users/${userId}/emails`)
      .set("Accept", "application/json")
      .send(body);

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ info });
    expect(mockCreate).toHaveBeenCalledTimes(1);
    expect(mockCreate).toHaveBeenCalledWith();
    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(mockSend).toHaveBeenCalledWith({
      html: inlineHTML,
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
  });

  it("calls the functions to send email with 'change_password' template", async () => {
    const body = {
      email: user.email,
      template: Template.CHANGE_PASSWORD,
      subject: Subject.CHANGE_PASSWORD,
    };
    const emailTemplatePath = path.join(
      __dirname,
      "..",
      "views",
      "emails",
      `${body.template}.ejs`
    );
    const emailTemplate = await readFile(emailTemplatePath, "utf-8");
    const publicFolder = path.join(process.cwd(), "src", "public");
    const publicUrl = `file://${publicFolder}/`;
    const html = ejs.render(
      emailTemplate,
      {
        url: `${SERVER_URL}/changePassword/${userId}&${token.token}`,
        title: "Change Password",
      },
      {
        filename: emailTemplatePath,
      }
    );
    const inlineHTML = await inlineCss(html, {
      url: publicUrl,
      removeLinkTags: true,
    });

    const response = await request(app)
      .post(`/api/users/${userId}/emails`)
      .set("Accept", "application/json")
      .send(body);

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ info });
    expect(mockCreate).toHaveBeenCalledTimes(1);
    expect(mockCreate).toHaveBeenCalledWith();
    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(mockSend).toHaveBeenCalledWith({
      html: inlineHTML,
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
  });

  it("calls the functions to send email with 'forgot_password' template when userId is undefined", async () => {
    const body = {
      email: user.email,
      template: Template.FORGOT_PASSWORD,
      subject: Subject.FORGOT_PASSWORD,
    };
    const emailTemplatePath = path.join(
      __dirname,
      "..",
      "views",
      "emails",
      `${Template.CHANGE_PASSWORD}.ejs`
    );
    const emailTemplate = await readFile(emailTemplatePath, "utf-8");
    const publicFolder = path.join(process.cwd(), "src", "public");
    const publicUrl = `file://${publicFolder}/`;
    const html = ejs.render(
      emailTemplate,
      {
        url: `${SERVER_URL}/changePassword/${userId}&${token.token}`,
        title: "Forgot Password",
      },
      {
        filename: emailTemplatePath,
      }
    );
    const inlineHTML = await inlineCss(html, {
      url: publicUrl,
      removeLinkTags: true,
    });
    const mockGetByEmail = jest
      .spyOn(userQueries, "getByEmail")
      .mockResolvedValue(user);

    const response = await request(app)
      .post(`/api/users/${undefined}/emails`)
      .set("Accept", "application/json")
      .send(body);

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ info });
    expect(mockGetByEmail).toHaveBeenCalledTimes(1);
    expect(mockGetByEmail).toHaveBeenCalledWith(user.email);
    expect(mockCreate).toHaveBeenCalledTimes(1);
    expect(mockCreate).toHaveBeenCalledWith();
    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(mockSend).toHaveBeenCalledWith({
      html: inlineHTML,
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
  });

  it("calls the functions to send email with 'change_email' template", async () => {
    const body = {
      email: user.email,
      template: Template.CHANGE_EMAIL,
      subject: Subject.CHANGE_EMAIL,
    };
    const emailTemplatePath = path.join(
      __dirname,
      "..",
      "views",
      "emails",
      `${body.template}.ejs`
    );
    const emailTemplate = await readFile(emailTemplatePath, "utf-8");
    const publicFolder = path.join(__dirname, "..", "public");
    const publicUrl = `file://${publicFolder}/`;
    const html = ejs.render(
      emailTemplate,
      {
        url: `${SERVER_URL}/changeEmail/${userId}&${token.token}`,
        title: "Change Email",
      },
      {
        filename: emailTemplatePath,
      }
    );
    const inlineHTML = await inlineCss(html, {
      url: publicUrl,
      removeLinkTags: true,
    });

    const response = await request(app)
      .post(`/api/users/${userId}/emails`)
      .set("Accept", "application/json")
      .send(body);

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ info });
    expect(mockCreate).toHaveBeenCalledTimes(1);
    expect(mockCreate).toHaveBeenCalledWith();
    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(mockSend).toHaveBeenCalledWith({
      html: inlineHTML,
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
  });
});
