import { SendEmailCommandOutput } from "@aws-sdk/client-ses";
import { Subject, Template } from "common";
import { Request, Response } from "express";
import ejs from "ejs";
import asyncHandler from "express-async-handler";
import { body } from "express-validator";
import { readFile } from "node:fs/promises";
import path from "path";

import { boss } from "../db/boss";
import { tokenQueries } from "../db/token_queries";
import { errorValidationHandler } from "../middleware/error_validation_handler";
import { email } from "../utils/email";
import { userQueries } from "../db/user_queries";
import { variables } from "../config/variables";

const { SERVER_URL, SERVER_PORT } = variables;

// @desc Sends an email
// @route POST /api/users/:userId/emails
// @access Private
export const send_email = [
  body("email")
    .trim()
    .escape()
    .isLength({ min: 1 })
    .withMessage("'email' must be specified.")
    .bail()
    .isEmail()
    .withMessage(`'email' must be a valid email.`),
  body("subject")
    .notEmpty({ ignore_whitespace: true })
    .withMessage("'subject' must be specified.")
    .bail()
    .custom((value: string): value is Subject =>
      Object.values(Subject)
        .map((subject) => subject.toString())
        .includes(value)
    )
    .withMessage(
      `'subject' must be a value in this enum: ${Object.values(Subject)}.`
    ),
  body("template")
    .notEmpty({ ignore_whitespace: true })
    .withMessage("'template' must be specified.")
    .bail()
    .custom((value: string): value is Template =>
      Object.values(Template)
        .map((template) => template.toString())
        .includes(value)
    )
    .withMessage(
      `'template' must be a value in this enum: ${Object.values(Template)}.`
    ),
  errorValidationHandler,
  asyncHandler(
    async (
      req: Request<
        { userId: string },
        unknown,
        { template: Template; subject: Subject; email: string }
      >,
      res: Response<{ info: SendEmailCommandOutput }>
    ) => {
      let userId = req.params.userId;
      const { template, subject } = req.body;

      let templateName = template;
      if (template === Template.FORGOT_PASSWORD) {
        templateName = Template.CHANGE_PASSWORD;
      }

      const emailTemplate = await readFile(
        path.join(__dirname, "..", "views", "emails", `${templateName}.ejs`),
        "utf-8"
      );
      const token = await tokenQueries.create();
      if (isNaN(Number(userId))) {
        const user = await userQueries.getByEmail(req.body.email);
        if (user) {
          userId = String(user.id);
        }
      }
      let templateRoute = "";
      let templateTitle = "";
      switch (template) {
        case Template.CHANGE_EMAIL:
          templateRoute = "changeEmail";
          break;
        case Template.CONFIRM_ACCOUNT:
          templateRoute = "confirmAccount";
          break;
        case Template.CHANGE_PASSWORD:
          templateRoute = "changePassword";
          templateTitle = "Change Password";
          break;
        case Template.FORGOT_PASSWORD:
          templateRoute = "changePassword";
          templateTitle = "Forgot Password";
          break;
      }
      const html = ejs.render(emailTemplate, {
        url: `${SERVER_URL}:${SERVER_PORT}/${templateRoute}/${userId}&${token.token}`,
        ...(templateTitle != "" && { title: templateTitle }),
      });
      const info = await email.sendMail({
        to: req.body.email,
        subject,
        html,
      });

      const ms = 30 * 60 * 1000; // 30 minutes in ms
      const date = new Date(Date.now() + ms);

      const queueName = `${userId}-email-queue`;
      await boss.sendAfter(queueName, { token }, {}, date);

      res.status(200).json({ info });
    }
  ),
];
