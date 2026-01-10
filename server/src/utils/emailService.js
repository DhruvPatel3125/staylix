const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.error("Missing SMTP Credentials in Environment Variables!");
        throw new Error("SMTP_USER or SMTP_PASS is missing");
    }

    // 1) Create a transporter
    // Using 'service: gmail' automatically handles host, port (587 or 465), and security settings.
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    // 2) Define the email options
    const mailOptions = {
        from: `${process.env.FROM_NAME || 'Staylix Support'} <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html, // Optional: for sending HTML emails
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
