const axios = require("axios");

async function sendWebhook(payload) {
  const url = process.env.WEBHOOK_URL;
  if (!url) {
    console.log("WEBHOOK_URL not set, skipping webhook");
    return { skipped: true };
  }

  try {
    const res = await axios.post(url, payload, {
      headers: { "Content-Type": "application/json" },
      timeout: 5000,
    });

    console.log("Webhook sent:", res.status);
    return { ok: true, status: res.status };
  } catch (err) {
    console.error("Webhook failed:", err.message);
    return { ok: false, error: err.message };
  }
}

module.exports = { sendWebhook };
