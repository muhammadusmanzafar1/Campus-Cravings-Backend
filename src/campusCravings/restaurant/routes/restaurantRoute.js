const express = require("express");
const router = express.Router();
const httpStatus = require("http-status");
const ApiError = require('../../../../utils/ApiError');
const { validate } = require('../../../../middlewares/auth');
const { getnearbyRestaurant, searchRestaurantsandFoodItems } = require('../controllers/restaurantController');
const { nearbyRestaurantSchema, searchSchema } = require("../validators/restaurant");
const { validateBody } = require("../../../../middlewares/validate");


// Find nearby Restaurants
router.get("/nearby", validate, validateBody(nearbyRestaurantSchema), async (req, res) => {
    try {
        const nearbyRestaurant = await getnearbyRestaurant(req, res);
        res.status(httpStatus.status.OK).json({ message: "Nearby Restaurants fetched successfully", nearbyRestaurant: nearbyRestaurant });
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }
});

// Search Restaurants or Food Items
router.get("/search", validate, validateBody(searchSchema), async (req, res) => {
    try {
        const search = await searchRestaurantsandFoodItems(req, res);
        res.status(httpStatus.status.OK).json({ message: "Nearby Restaurants fetched successfully", searchResult: search });
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }
});

module.exports = router;