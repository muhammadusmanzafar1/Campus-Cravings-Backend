const express = require('express');
const router = express.Router();
const httpStatus = require("http-status");
const ApiError = require('../../../../utils/ApiError');
const { getAnalytics } = require('../controllers/analyticsController');


// Get data analytics
router.get("/:days", async (req, res) => {
    try {
        const allOrders = await getAnalytics(req, res);
        res.status(httpStatus.status.OK).json({ message: "Orders fetched successfully", orders: allOrders });
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }
});

module.exports = router;
