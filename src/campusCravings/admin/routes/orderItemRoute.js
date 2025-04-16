const express = require('express');
const router = express.Router();
const httpStatus = require("http-status");
const ApiError = require('../../../../utils/ApiError');
const { getAllOrderItems, createOrderItem, updateOrderItem, deleteOrderItem } = require('../controllers/orderItemController');

router.get("/", async (req, res) => {
    try {
        const items = await getAllOrderItems(req, res);
        res.status(httpStatus.status.OK).json({ message: "Order items fetched", orderItems: items });
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }
});

router.post("/", async (req, res) => {
    try {
        const item = await createOrderItem(req, res);
        res.status(httpStatus.status.CREATED).json({ message: "Order item created", orderItem: item });
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }
});

router.put("/:id", async (req, res) => {
    try {
        const item = await updateOrderItem(req, res);
        res.status(httpStatus.status.OK).json({ message: "Order item updated", orderItem: item });
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const item = await deleteOrderItem(req, res);
        res.status(httpStatus.status.OK).json({ message: "Order item deleted", orderItem: item });
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }
});

module.exports = router;
