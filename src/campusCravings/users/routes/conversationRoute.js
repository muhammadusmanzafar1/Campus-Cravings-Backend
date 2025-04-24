const express = require('express');
const router = express.Router();
const { getConversationDetails } = require('../controllers/conversationController');
const { validateBody } = require("../../../../middlewares/validate");
const { getConversationSchema } = require("../validators/conversation");

// Get Conversation Details
router.get(
    "/getConversationDetails",
    validateBody(getConversationSchema),
    getConversationDetails
);

module.exports = router;