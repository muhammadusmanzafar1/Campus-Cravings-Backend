const express = require('express');
const router = express.Router();
const stripeWebhookController = require('../controller/stripeWebhookController');

router.post('/webhook', stripeWebhookController.stripeWebhook);

module.exports = router;