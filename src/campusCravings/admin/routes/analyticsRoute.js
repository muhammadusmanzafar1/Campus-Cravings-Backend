const express = require('express');
const router = express.Router();
const httpStatus = require("http-status");
const ApiError = require('../../../../utils/ApiError');
const { getAnalytics, getRevenueAnalytics } = require('../controllers/analyticsController');


// Get data analytics
router.get("/:days", async (req, res) => {
    try {
        const analyticReport = await getAnalytics(req, res);
        res.status(httpStatus.status.OK).json({ message: "Analytic data fetched successfully", analytics: analyticReport });
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }
});

// Get Revenue Data 
router.get("/revenue/:timeframe", async (req, res) => {
    try {
        const revenueRoport = await getRevenueAnalytics(req, res);
        res.status(httpStatus.status.OK).json({ message: "Revenue Data fetched successfully", revenueRoport: revenueRoport });
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }
});
module.exports = router;
// get all order with respect to restaurant id 
// order with respect to user id

// Extract Revenue for admin total
// Extract revenue for restaurant id 

// Need to add order type in order schema
// ticker filter by days
