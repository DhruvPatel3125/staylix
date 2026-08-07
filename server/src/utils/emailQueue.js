const sendEmail = require("./emailService");

const isVercelWithoutRedis = Boolean(process.env.VERCEL) && !process.env.REDIS_URL;
const redisDisabled = String(process.env.REDIS_DISABLED || 'false').toLowerCase() === 'true' || isVercelWithoutRedis || !process.env.REDIS_URL;

let emailQueue = null;

if (!redisDisabled) {
    try {
        const Queue = require('bull');
        emailQueue = new Queue("email-tasks", process.env.REDIS_URL);
        
        emailQueue.process(async (job) => {
            const { email, subject, html, message } = job.data;
            console.log(`[Queue] Processing email for: ${email}`);
            try {
                await sendEmail({ email, subject, html, message });
                console.log(`[Queue] Email sent successfully to ${email}`);
            } catch (error) {
                console.log(`[Queue] Failed to send email to ${email}: ${error.message}`);
                throw error;
            }
        });

        emailQueue.on('completed', (job) => {
            console.log(`[Queue] Job ${job.id} completed`);
        });
        emailQueue.on('failed', (job, error) => {
            console.log(`[Queue] Job ${job.id} failed: ${error.message}`);
        });
    } catch (err) {
        console.error('[Queue] Failed to initialize Bull queue, falling back to direct email sending:', err.message);
        emailQueue = null;
    }
}

const safeEmailQueue = {
    add: async (data, options) => {
        if (emailQueue) {
            try {
                return await emailQueue.add(data, options);
            } catch (err) {
                console.warn('[Queue] Failed to push to queue, sending email directly:', err.message);
            }
        }
        return sendEmail(data).catch((err) => {
            console.error('[Email] Direct send error:', err.message);
        });
    }
};

module.exports = safeEmailQueue;