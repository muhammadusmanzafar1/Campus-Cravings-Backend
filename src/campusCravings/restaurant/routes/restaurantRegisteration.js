const express = require("express");
const router = express.Router();
const httpStatus = require("http-status");
const ApiError = require('../../../../utils/ApiError');
const { validate } = require('../../../../middlewares/auth');
const restaurant = require('../controllers/restaurantController')


router.get("/getrestaurantAnalytics", validate, async (req, res, next) => {
    try {
        const getItem = await restaurant.getRestaurantAnalytics(req, res, next);
        res.status(httpStatus.status.OK).json({ message: "Items retrieved successfully", items: getItem });
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }
});