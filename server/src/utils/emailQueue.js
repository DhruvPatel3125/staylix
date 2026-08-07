// emailQueue removed — emails are sent directly without Redis/Bull
const sendEmail = require("./emailService");

const emailQueue = {
    add: async (data) => {
        try {
            await sendEmail(data);
            console.log(`[Email] Sent successfully to ${data.email}`);
        } catch (err) {
            console.error(`[Email] Failed to send to ${data.email}:`, err.message);
        }
    }
};

module.exports = emailQueue;