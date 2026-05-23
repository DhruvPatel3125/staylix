require('dotenv').config();
console.log('Key length:', process.env.RECAPTCHA_SECRET_KEY.length);
console.log('Key value:', JSON.stringify(process.env.RECAPTCHA_SECRET_KEY));
