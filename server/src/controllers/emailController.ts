import ejs from "ejs";
import asyncHandler from "express-async-handler";
import { body } from "express-validator";
import { Job } from "pg-boss";
import { readFile } from "node:fs/promises";
import { SentMessageInfo } from "nodemailer";
import path from "path";

import { variables } from "../config/variables";
import { Token, TokenQueries } from "../db/tokenQueries";
import { errorValidationHandler } from "../middleware/errorValidationHandler";
import { Email } from "../utils/email";
import { scheduler } from "../utils/scheduler";
import { UserQueries } from "../db/userQueries";

const { SERVER_URL, SERVER_PORT, FRONTEND_URL, FRONTEND_VERIFICATION } =
  variables;

const tokenQueries = new TokenQueries();

export const send_email = [
  body("email")
    .trim()
    .escape()
    .isLength({ min: 1 })
    .withMessage("'email' must be specified.")
    .bail()
    .isEmail()
    .withMessage(`'email' must be a valid email.`),
  body("template")
    .trim()
    .escape()
    .isLength({ min: 1 })
    .withMessage("'template' must be specified."),
  body("subject")
    .trim()
    .escape()
    .isLength({ min: 1 })
    .withMessage("'subject' must be specified."),
  errorValidationHandler,
  asyncHandler(async (req, res) => {
    const userId = req.params.userId;
    const template = req.body.template;
    const subject = req.body.subject;

    const email = new Email();
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

export const verify_email = asyncHandler(async (req, res) => {
  const userId = req.params.userId;
  const token = req.params.token;
  const isValidToken = await tokenQueries.verify(token);

  if (!isValidToken) {
    res.status(302).redirect(`${FRONTEND_URL}/failed-verification`);
    return;
  }

  const userQueries = new UserQueries();
  const user = await userQueries.getById(userId);
  if (user!.confirmed === false) {
    await userQueries.updateById(userId, { confirmed: true });
    res.status(302).redirect(`${FRONTEND_URL}/users/${userId}/confirmation`);
    return;
  }

  await tokenQueries.deleteAll([token]);
  res
    .status(302)
    .redirect(`${FRONTEND_URL}/users/${userId}/${FRONTEND_VERIFICATION}`);
  return;
});
