const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
});

const sendEmail = async ({ email, subject, message, html }) => {
    if (
        !process.env.SMTP_HOST ||
        !process.env.SMTP_USER ||
        !process.env.SMTP_PASS ||
        !process.env.EMAIL_FROM
    ) {
        throw new Error('SMTP environment variables are missing');
    }

    await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: email,
        subject,
        text: message,
        html: html || undefined,
    });
};

module.exports = sendEmail;