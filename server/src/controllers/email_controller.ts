import ejs from "ejs";
import asyncHandler from "express-async-handler";
import { body } from "express-validator";
import { readFile } from "node:fs/promises";
import { SentMessageInfo } from "nodemailer";
import path from "path";
import { Job } from "pg-boss";

import { variables } from "../config/variables";
import { Token, tokenQueries } from "../db/token_queries";
import { userQueries } from "../db/user_queries";
import { errorValidationHandler } from "../middleware/error_validation_handler";
import { email } from "../utils/email";
import { scheduler } from "../utils/scheduler";

const { FRONTEND_VERIFICATION, FRONTEND_URL, SERVER_URL, SERVER_PORT } =
  variables;

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
    .trim()
    .escape()
    .isLength({ min: 1 })
    .withMessage("'subject' must be specified."),
  body("template")
    .trim()
    .escape()
    .isLength({ min: 1 })
    .withMessage("'template' must be specified."),
  errorValidationHandler,
  asyncHandler(async (req, res) => {
    const userId = req.params.userId;
    const template = req.body.template;
    const subject = req.body.subject;

    const emailTemplate = await readFile(
      path.join(__dirname, "..", "views", `${template}.ejs`),
      "utf-8"
    );
    const token = await tokenQueries.create();
    const url = `${SERVER_URL}:${SERVER_PORT}/api/users/${userId}/emails/${token.token}`;
    const html = ejs.render(emailTemplate, { url });
    const info: SentMessageInfo = await email.sendMail({
      to: req.body.email,
      subject,
      html,
    });

    const ms = 30 * 60 * 1000; // 30 minutes in ms
    const date = new Date(Date.now() + ms);

    const queueName = `queue-${userId}`;
    await scheduler.sendAfter(queueName, { token }, date);

    await scheduler.work(queueName, async (jobs: Job<Token>[]) => {
      const tokens = jobs.map((job) => {
        return job.data.token;
      });
      await tokenQueries.deleteAll(tokens);
    });

    res.status(200).json({ info });
  }),
];
