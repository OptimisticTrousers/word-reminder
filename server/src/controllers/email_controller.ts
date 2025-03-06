import { Subject, Template, Token } from "common";
import ejs from "ejs";
import asyncHandler from "express-async-handler";
import { body } from "express-validator";
import { readFile } from "node:fs/promises";
import path from "path";
import { Job } from "pg-boss";

import { boss } from "../db/boss";
import { tokenQueries } from "../db/token_queries";
import { errorValidationHandler } from "../middleware/error_validation_handler";
import { email } from "../utils/email";
import { userQueries } from "../db/user_queries";

// @desc Sends an email
// @route POST /api/emails
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
    .custom((value) => Object.values<string>(Subject).includes(value))
    .withMessage(
      `'subject' must be a value in this enum: ${Object.values(Subject)}.`
    ),
  body("template")
    .notEmpty({ ignore_whitespace: true })
    .withMessage("'template' must be specified.")
    .bail()
    .custom((value) => Object.values<string>(Template).includes(value))
    .withMessage(
      `'template' must be a value in this enum: ${Object.values(Template)}.`
    ),
  errorValidationHandler,
  asyncHandler(async (req, res) => {
    let userId = req.params.userId;
    const { template, subject } = req.body;

    const emailTemplate = await readFile(
      path.join(__dirname, "..", "views", "emails", `${template}.ejs`),
      "utf-8"
    );
    const token = await tokenQueries.create();
    if (isNaN(Number(userId))) {
      const user = await userQueries.getByEmail(req.body.email);
      if (user) {
        userId = String(user.id);
      }
    }
    const html = ejs.render(emailTemplate, {
      url: `/${template}/${userId}&${token.token}`,
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

    await boss.work(queueName, async (jobs: Job<Token>[]) => {
      const tokens = jobs.map((job) => {
        return job.data.token;
      });
      await tokenQueries.deleteAll(tokens);
    });

    res.status(200).json({ info });
  }),
];
