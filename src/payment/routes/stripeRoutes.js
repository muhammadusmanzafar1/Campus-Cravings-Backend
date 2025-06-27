const express = require('express');
const router = express.Router();
const stripeWebhookController = require('../controller/stripeWebhookController');
const bodyParser = require('body-parser');

router.post('/', bodyParser.raw({ type: "application/json" }), stripeWebhookController.stripeWebhook);

module.exports = router;