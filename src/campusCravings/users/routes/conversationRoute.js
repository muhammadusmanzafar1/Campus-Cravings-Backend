const express = require('express');
const router = express.Router();
const { getConversationDetails } = require('../controllers/conversationController');
const { getConversationSchema } = require("../validators/conversation");

// Get Conversation Details
router.get(
    "/getConversationDetails",
    getConversationDetails
);

module.exports = router;