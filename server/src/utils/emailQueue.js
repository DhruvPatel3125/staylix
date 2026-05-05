const Queue = require('bull')
const sendEmail = require("./emailService")

const emailQueue = new Queue("email-tasks",process.env.REDIS_URL || "redis://127.0.0.1:6379") 
emailQueue.process(async (job) =>{
    const {email,subject,html,message} = job.data;
    console.log(`[Queue] Processing email for: ${email}`);
    try {
        await sendEmail({email,subject,html,message});
        console.log(`[Queue] Email sent successfully to ${email}`)
    } catch (error) {
        console.log(`[Queue] Failed to send email to ${email} : ${error.message}`);
        throw error;
    }
})

emailQueue.on('completed',(job) => {
    console.log(`[Queue] Job ${job.id} completed`);
})
emailQueue.on('failed',(job,error) => {
    console.log(`[Queue] Job ${job.id} failed: ${error.message}`);
})
module.exports = emailQueue