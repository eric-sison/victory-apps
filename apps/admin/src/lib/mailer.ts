import nodemailer from "nodemailer";

// Reads from process.env at runtime — these are provided by apps/api/.env,
// not packages/auth/.env (which is only used for migrations/seeding).
export const mailer = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 1025),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});
