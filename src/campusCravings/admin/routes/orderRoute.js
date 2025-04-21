const express = require('express');
const router = express.Router();
const httpStatus = require("http-status");
const ApiError = require('../../../../utils/ApiError');
const { getAllOrders, createOrder, deleteOrder, patchOrder, getOrder, getResturantAllOrders, getUserAllOrders } = require('../controllers/orderController');
const { validateBody } = require("../../../../middlewares/validate");
const { updateOrderSchema, createOrderSchema } = require("../validators/order");
// Get All Orders
router.get("/", async (req, res) => {
    try {
        const allOrders = await getAllOrders(req, res);
        res.status(httpStatus.status.OK).json({ message: "Orders fetched successfully", orders: allOrders });
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }
});

// Add a new Order
router.post("/", validateBody(createOrderSchema), async (req, res) => {
    try {
        const newOrder = await createOrder(req, res);
        res.status(httpStatus.status.CREATED).json({
            message: "Order created successfully",
            order: newOrder,
        });
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }
});

// Delete an Order
router.delete("/:id", async (req, res) => {
    try {
        const deletedOrder = await deleteOrder(req, res);
        res.status(httpStatus.status.OK).json({
            message: "Order deleted successfully",
            order: deletedOrder,
        });
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }
});
// Patch an Order
router.patch("/:id", validateBody(updateOrderSchema), async (req, res) => {
    try {
        const updatedOrder = await patchOrder(req, res);
        res.status(httpStatus.status.OK).json({
            message: "Order updated successfully",
            order: updatedOrder,
        });
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }
});
// Get a specific Order
router.get("/:id", async (req, res) => {
    try {
        const order = await getOrder(req, res);
        res.status(httpStatus.status.OK).json({ message: "Data Fetch Successfully", order: order });
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }
});
// Get all orders with respect to restaurant id
router.get("/resturant/:restaurantId", async (req, res) => {
    try {
        const allOrders = await getResturantAllOrders(req, res);
        res.status(httpStatus.status.OK).json({ message: "Orders fetched successfully", orders: allOrders });
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }
});

// Get all orders with respect to User id
router.get("/user/:userId", async (req, res) => {
    try {
        const allOrders = await getUserAllOrders(req, res);
        res.status(httpStatus.status.OK).json({ message: "Orders fetched successfully", orders: allOrders });
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }
});
module.exports = router;
