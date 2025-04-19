const express = require('express');
const router = express.Router();
const httpStatus = require("http-status");
const ApiError = require('../../../../utils/ApiError');
const { validate } = require('../../../../middlewares/auth');
const { getAnalytics, getRevenueAnalytics, getResturantAnalytics, getTopRestaurants } = require('../controllers/analyticsController');


// Get data analytics
router.get("/:days", validate, async (req, res) => {
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
router.get("/revenue/:timeframe", validate, async (req, res) => {
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

// Get data analytics with respect to restaurant id
router.get("/:restaurantId/:days", validate, async (req, res) => {
    try {
        const analyticReport = await getResturantAnalytics(req, res);
        res.status(httpStatus.status.OK).json({ message: "Analytic data fetched successfully", analytics: analyticReport });
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }
});

// Get top 6 restaurants based on order count
router.get("/topRestaurants", validate, async (req, res) => {
    try {
        const analyticReport = await getTopRestaurants(req, res);
        res.status(httpStatus.status.OK).json({ message: "Top Restaurants fetched successfully", topRestaurants: analyticReport });
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }
})
module.exports = router;
