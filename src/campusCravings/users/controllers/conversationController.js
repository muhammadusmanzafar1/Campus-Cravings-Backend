'use strict';
const conversationService = require('../services/conversation');
const asyncHandler = require('express-async-handler');
const httpStatus = require("http-status");
const ApiError = require('../../../../utils/ApiError');
const { getConversationSchema } = require('../validators/conversation')

const getConversationDetails = asyncHandler(async (req, res) => {
    try {

        const { error, value } = getConversationSchema.validate(req.query);
        if (error) {
            throw new ApiError(httpStatus.BAD_REQUEST, error.details[0].message);
        }

        const { isCustomer, orderId } = value;
        const data = await conversationService.getConversationDetails(req, { isCustomer, orderId });
        res.status(httpStatus.status.OK).json({ message: "Conversation data fetched successfully", conversationDetails: data });
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }
});

module.exports = {
    getConversationDetails
};

