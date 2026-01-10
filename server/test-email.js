require('dotenv').config();
const sendEmail = require('./src/utils/emailService');

const test = async () => {
    try {
        console.log('Attempting to send test email...');
        console.log(`Host: ${process.env.SMTP_HOST}`);
        console.log(`Port: ${process.env.SMTP_PORT}`);
        console.log(`User: ${process.env.SMTP_USER}`);

        await sendEmail({
            email: process.env.SMTP_USER, // Send to self
            subject: 'Test Email from Staylix',
            message: 'This is a test email to verify the SMTP configuration.',
        });
        console.log('Test email sent successfully!');
    } catch (error) {
        console.error('Failed to send test email:', error);
    }
};

test();
