const express = require("express");
const router = express.Router();
const httpStatus = require("http-status");
const ApiError = require('../../../../utils/ApiError');
const restaurant = require('../controllers/restaurantController')
const { validateBody } = require("../../../../middlewares/validate");
const { nearbyRestaurantSchema, searchSchema, updateRestaurantSchema } = require("../validators/restaurant");
const Restaurant = require("../models/restaurant");


router.get("/getrestaurantAnalytics", async (req, res, next) => {
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

router.get("/getrestaurantAllCategory/:id", async (req, res, next) => {
    try {
        const getItem = await restaurant.getAllCategoryByRestaurantId(req, res, next);


        res.status(httpStatus.status.OK).json({
            isSuccess: true,
            message: "Items retrieved successfully",
            RestaurantData: getItem
        });

    } catch (error) {
        console.error("Error while fetching categories:", error);
    }
});


router.get("/getAllRestaurant/:id", async (req, res, next) => {
    try {
        const getItem = await restaurant.getAllRestaurant(req, res, next);


        return res.status(httpStatus.OK).json({
            isSuccess: true,
            message: "Items retrieved successfully",
            items: getItem
        });

    } catch (error) {
        console.error("Error while fetching categories:", error);
        next(error); // Pass the error to the global error handler
    }
});

router.get('/getNearbyRestaurants', async (req, res, next) => {
    try {
        if (!req.query.latitude || !req.query.longitude) {
            return res.status(httpStatus.status.BAD_REQUEST).json({
                isSuccess: false,
                message: "Missing required parameters: latitude and longitude are required."
            });
        }

        const result = await restaurant.getTwentyMilesRestaurents(req, res, next);

        if (!result || result.length === 0) {
            return res.status(httpStatus.status.NOT_FOUND).json({
                isSuccess: false,
                message: "No nearby restaurants found within 20 miles."
            });
        }

        return res.status(httpStatus.status.OK).json({
            isSuccess: true,
            message: "Items retrieved successfully",
            items: result
        });
    } catch (error) {
        console.error("Error while fetching nearby restaurants:", error);

        if (error instanceof ApiError) {
            return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({
                isSuccess: false,
                message: "An error occurred while processing the request. Please try again later."
            });
        }

        return next(error);
    }
});

router.get('/getNearbyPopularFood', async (req, res, next) => {
    try {
        if (!req.query.latitude || !req.query.longitude) {
            return res.status(httpStatus.status.BAD_REQUEST).json({
                isSuccess: false,
                message: "Missing required parameters: latitude and longitude are required."
            });
        }

        const result = await restaurant.getpoplarFoodItems(req, res, next);

        if (!result || result.length === 0) {
            return res.status(httpStatus.status.NOT_FOUND).json({
                isSuccess: false,
                message: "No nearby restaurants food items found within 20 miles."
            });
        }

        return res.status(httpStatus.status.OK).json({
            isSuccess: true,
            message: "Items retrieved successfully",
            items: result
        });
    } catch (error) {
        console.error("Error while fetching nearby restaurants:", error);

        if (error instanceof ApiError) {
            return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({
                isSuccess: false,
                message: "An error occurred while processing the request. Please try again later."
            });
        }

        return next(error);
    }
});

// Find nearby Restaurants
router.get("/nearby", validateBody(nearbyRestaurantSchema), async (req, res) => {
    try {
        const nearbyRestaurant = await restaurant.getnearbyRestaurant(req, res);
        res.status(httpStatus.status.OK).json({ message: "Nearby Restaurants fetched successfully", nearbyRestaurant: nearbyRestaurant });
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }
});

// Search Restaurants or Food Items
router.get("/search", validateBody(searchSchema), async (req, res) => {
    try {
        const search = await restaurant.searchRestaurantsandFoodItems(req, res);
        res.status(httpStatus.status.OK).json({ message: "Nearby Restaurants fetched successfully", searchResult: search });
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }
});

// Get data analytics with respect to restaurant id
router.get("/analytics/:days", async (req, res) => {
    try {
        const analyticReport = await restaurant.getResturantAnalytics(req, res);
        res.status(httpStatus.status.OK).json({ message: "Analytic data fetched successfully", analytics: analyticReport });
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }
});

router.put('/orderAcceptByRestaurant', async (req, res) => {
    try {
        const orderAccept = await restaurant.OrderAccept(req, res);
        res.status(httpStatus.status.OK).json({ message: "Nearby Restaurants fetched successfully", data: orderAccept });
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }
})
router.patch('/', validateBody(updateRestaurantSchema), async (req, res) => {
    try {
        const updatedRestaurant = await restaurant.updateRestaurantDetail(req, res);
        res.status(httpStatus.status.OK).json({ message: "Restaurant Details Updated Successfully", data: updatedRestaurant });
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }
})
module.exports = router;