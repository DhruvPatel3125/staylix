const axios = require('axios');
const WebhookLog = require('../models/WebhookLog');

/**
 * Sends data to a Make.com (formerly Integromat) webhook URL.
 * @param {Object} data - The payload to send to the automation.
 */
const triggerAutomation = async (data) => {
  const startTime = Date.now();
  const event = data.event || 'unknown.event';
  const webhookUrl = process.env.MAKE_WEBHOOK_URL;
  
  const payload = {
    ...data,
    timestamp: new Date().toISOString(),
    platform: 'Staylix'
  };

  // 1. Handle missing/placeholder URL
  if (!webhookUrl || webhookUrl.includes('REPLACE_WITH_YOUR_WEBHOOK_ID')) {
    console.warn(`[Automation] Skipping ${event}: MAKE_WEBHOOK_URL is not configured.`);
    
    // Log as 'failed' because it couldn't be sent
    await WebhookLog.create({
      event,
      payload,
      status: 'failed',
      errorMessage: 'MAKE_WEBHOOK_URL is not configured or contains placeholder',
      responseTime: 0
    }).catch(err => console.error('[Automation Log Error]', err));
    
    return;
  }

  try {
    // 2. Send to Webhook
    const response = await axios.post(webhookUrl, payload);
    const responseTime = Date.now() - startTime;

    // 3. Log success
    await WebhookLog.create({
      event,
      payload,
      status: 'success',
      responseTime
    }).catch(err => console.error('[Automation Log Error]', err));

    console.log(`[Automation] Successfully triggered: ${event}`);
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error(`[Automation Error] Failed to trigger ${event}:`, error.message);

    // 4. Log failure
    await WebhookLog.create({
      event,
      payload,
      status: 'failed',
      errorMessage: error.message,
      responseTime
    }).catch(err => console.error('[Automation Log Error]', err));
  }
};

module.exports = { triggerAutomation };


