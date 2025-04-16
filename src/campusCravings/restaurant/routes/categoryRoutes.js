const express = require("express");
const router = express.Router();
const httpStatus = require("http-status");
const ApiError = require('../../../../utils/ApiError');
const { validate } = require('../../../../middlewares/auth');
const { createCategory, getItems, updateItems, deleteItems } = require('../controllers/categoryController')

router.post("/additem", async (req, res) => {

    try {
        const category = await createCategory(req, res);
        res.status(httpStatus.status.CREATED).json({ message: "User registered successfully", category: category });
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ message: error.message });
        }

        return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }
});

router.get("/getitem/:id", async (req, res) => {
    try {
        const getItem = await getItems(req, res);
        res.status(httpStatus.status.OK).json({ message: "Items retrieved successfully", itens: getItem });
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }
});

router.put("/updateItem", async (req, res) => {
    try {
        const updateItem = await updateItems(req, res);
        res.status(httpStatus.status.OK).json({ message: "Item updated successfully", item: updateItem });
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }
});

router.delete("/deleteitem/:id", async (req, res) => {
    try {
        const deleteItem = await deleteItems(req, res);
        res.status(httpStatus.status.OK).json({ message: "Item deleted successfully", item: deleteItem });
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }
});

module.exports = router;