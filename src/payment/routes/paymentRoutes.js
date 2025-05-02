
const express = require('express');
const router = express.Router();
const { handleOrderDelivered, startStripeOnboarding } = require('../controller/paymentController');
const ApiError = require('../../../utils/ApiError');

router.get('/onboard/:userId', async (req, res) => {
    try {
        const data = await startStripeOnboarding(req, res);
        res.status(200).json({ message: "Onboarding link generated successfully", data });
    } catch (error) {
        console.error(error);
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(500).json({ message: error.message || "Server Error" });
    }
});
router.post('/order/:orderId/delivered', handleOrderDelivered);

module.exports = router;
