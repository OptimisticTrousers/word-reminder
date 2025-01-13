import { createTransport, SentMessageInfo} from "nodemailer";

import { variables } from "../config/variables";

const {
  PROTON_SMTP_USER,
  PROTON_SMTP_TOKEN,
  PROTON_SMTP_SERVER,
  PROTON_SMTP_PORT,
} = variables;

export const email = (function () {
  const transporter = createTransport({
    host: PROTON_SMTP_SERVER,
    port: Number(PROTON_SMTP_PORT),
    secure: false, // It actually uses STARTTLS, there are no shared keys
    auth: {
      user: PROTON_SMTP_USER,
      pass: PROTON_SMTP_TOKEN,
    },
  });

  const sendMail = async ({
    to,
    subject,
    html,
  }: {
    to: string;
    subject: string;
    html: string;
  }): Promise<SentMessageInfo> => {
    // send mail with defined transport object
    const info: SentMessageInfo = await transporter.sendMail({
      from: PROTON_SMTP_USER, // sender address
      to, // list of receivers
      subject, // Subject line
      html, // hmtl body
    });

    return info;
  };

  return { sendMail };
})();
