import nodemailer from "nodemailer";
import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";
import { config } from "./config";
import { check } from "./errors";
export async function sendMail(to: string, subject: string, text: string) {
  const c = config();
  if (c.MAIL_DRIVER === "smtp") {
    check(
      c.SMTP_URL,
      503,
      "MAIL_UNCONFIGURED",
      "Mail transport is not configured",
    );
    const info = await nodemailer
      .createTransport({
        url: c.SMTP_URL,
        connectionTimeout: 5000,
        socketTimeout: 8000,
        greetingTimeout: 5000,
      })
      .sendMail({ from: c.MAIL_FROM, to, subject, text });
    return String(info.messageId);
  }
  const client = new SESv2Client({
    region: c.AWS_REGION,
    requestHandler: { requestTimeout: 8000 },
  });
  const result = await client.send(
    new SendEmailCommand({
      FromEmailAddress: c.MAIL_FROM,
      Destination: { ToAddresses: [to] },
      Content: {
        Simple: { Subject: { Data: subject }, Body: { Text: { Data: text } } },
      },
    }),
  );
  return result.MessageId ?? "accepted";
}
