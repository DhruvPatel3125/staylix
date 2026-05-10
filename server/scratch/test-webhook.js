const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { triggerAutomation } = require('../src/utils/webhookUtils');
const WebhookLog = require('../src/models/WebhookLog');

dotenv.config();

const testAutomation = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected!');

    console.log('\n--- Triggering Test Automation ---');
    await triggerAutomation({
      event: 'test.manual',
      message: 'Hello from Staylix Test Script!',
      testData: {
        id: '12345',
        type: 'test_run'
      }
    });

    console.log('\n--- Checking Database for Logs ---');
    // Wait a bit for the async log to be created
    setTimeout(async () => {
      const latestLog = await WebhookLog.findOne().sort({ createdAt: -1 });
      if (latestLog) {
        console.log('Success! Log found in database:');
        console.log('- Event:', latestLog.event);
        console.log('- Status:', latestLog.status);
        console.log('- Time:', latestLog.createdAt);
      } else {
        console.log('No logs found. Check if your .env URL is configured.');
      }
      process.exit(0);
    }, 2000);

  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
};

testAutomation();
