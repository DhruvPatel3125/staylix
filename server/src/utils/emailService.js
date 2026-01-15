const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.error("Missing SMTP Credentials in Environment Variables!");
        throw new Error("SMTP_USER or SMTP_PASS is missing");
    }

    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = Number(process.env.SMTP_PORT) || 465;

    // Build transporter options so we can optionally allow self-signed certs
    const transportOptions = {
        host,
        port,
        secure: port === 465, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        logger: true, // Log to console
        debug: true,  // Include SMTP traffic in logs
    };

    // If EMAIL_ALLOW_SELF_SIGNED=true in env, allow self-signed certs (useful for testing or corporate proxies)
    if (process.env.EMAIL_ALLOW_SELF_SIGNED === 'true') {
        transportOptions.tls = { rejectUnauthorized: false };
        console.warn('Email service: allowing self-signed TLS certificates (EMAIL_ALLOW_SELF_SIGNED=true)');
    }

    // 1) Create a transporter
    const transporter = nodemailer.createTransport(transportOptions);

    // 2) Define the email options
    const mailOptions = {
        from: `"${process.env.FROM_NAME || 'Staylix Support'}" <${process.env.SMTP_USER}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html,
    };

    // 3) Actually send the email
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully: ${info.messageId}`);
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
};

module.exports = sendEmail;
