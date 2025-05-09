
const express = require('express');
const router = express.Router();
const { handleOrderDelivered, startStripeOnboarding } = require('../controller/paymentController');
const restaurant = require('../../campusCravings/restaurant/controllers/restaurantController');
const ApiError = require('../../../utils/ApiError');

router.get('/onboard/:userId', async (req, res) => {
    try {
        const data = await startStripeOnboarding(req, res);
        res.status(200).json({ message: "Onboarding link generated successfully", data });
    } catch (error) {
        console.error(error);
        if (error instanceof ApiError) {
            return res.status(500).json({ message: error.message });
        }
        return res.status(500).json({ message: error.message || "Server Error" });
    }
});

router.get('/changeRestaurantStatus/:id', async (req, res) => {
    try {
        const restaurantStatus = await restaurant.changeRestaurantStatus(req, res);
        res.status(httpStatus.status.OK).json({ message: "Restaurant Status Changed Successfully", data: restaurantStatus });
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }
}
)

router.post('/order/:orderId/delivered', handleOrderDelivered);

module.exports = router;
