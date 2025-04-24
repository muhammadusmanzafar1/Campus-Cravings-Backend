const express = require("express");
const router = express.Router();
const httpStatus = require("http-status");
const ApiError = require('../../../../utils/ApiError');
const rider = require('../controllers/riderController');
const { registerRiderSchema, deliverOrderSchema } = require('../validators/validation');


router.post("/riderRegistration", async (req, res, next) => {
    const { error, value } = registerRiderSchema.body.validate(req.body, { abortEarly: false });

    if (error) {
        return res.status(httpStatus.status.BAD_REQUEST).json({
            message: "Validation Error",
            errors: error.details.map(err => err.message),
        });
    }
    try {
        const riderRegister = await rider.registerRider(req, res, next);
        if (!riderRegister) {
            return next(new ApiError(httpStatus.status.BAD_REQUEST, "Invalid request"));
        }

        res.status(httpStatus.status.CREATED).json({ message: "Rider registered successfully", data: riderRegister });
    } catch (error) {
        console.error("Error in /addcategory route:", error);
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ message: error.message });
        }

        return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }
});

router.get('/getUnassignedOrders', async (req, res, next) => {
    try {
        const unassignedOrders = await rider.getUnassignedOrders(req, res, next);
        if (!unassignedOrders) {
            return next(new ApiError("Invalid request", httpStatus.status.BAD_REQUEST));
        }
        res.status(httpStatus.status.OK).json({ message: "Unassigned orders retrieved successfully", data: unassignedOrders });
    } catch (error) {
        console.error("Error in /getUnassignedOrders route:", error);
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }
});

router.patch('/deliverOrder', async (req, res, next) => {
    const { error, value } = deliverOrderSchema.body.validate(req.body, { abortEarly: false });

    if (error) {
        return res.status(httpStatus.status.BAD_REQUEST).json({
            message: "Validation Error",
            errors: error.details.map(err => err.message),
        });
    }
    try {
        const deliverOrder = await rider.deliverOrder(req, res, next);
        if (!deliverOrder) {
            return next(new ApiError("Invalid request", httpStatus.status.BAD_REQUEST));
        }
        res.status(httpStatus.status.OK).json({ message: "Order delivered successfully", data: deliverOrder });
    } catch (error) {
        console.error("Error in /deliverOrder route:", error);
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }
});
router.patch('/location', async (req, res, next) => {
    try {
        const location = await rider.updateLocation(req, res, next);
        if (!location) {
            return next(new ApiError("Invalid request", httpStatus.status.BAD_REQUEST));
        }
        res.status(httpStatus.status.OK).json({ message: "Location updated successfully", data: location });
    } catch (error) {
        console.error("Error in /location route:", error);
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }
});

router.put('/acceptOrder', async (req, res) => {
    try {
        const location = await rider.orderAccept(req, res, next);
        if (!location) {
            return next(new ApiError("Invalid request", httpStatus.status.BAD_REQUEST));
        }
        res.status(httpStatus.status.OK).json({ message: "Order Accpted", data: location });
    } catch (error) {
        console.error("Error in /location route:", error);
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }
})

module.exports = router;