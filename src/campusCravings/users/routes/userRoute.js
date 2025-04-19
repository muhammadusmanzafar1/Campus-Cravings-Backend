const express = require('express');
const router = express.Router();
const { validate } = require('../../../../middlewares/auth');
const { addUserAddress, updateUserAddress } = require('../controllers/userController');
const { validateBody } = require("../../../../middlewares/validate");
const { addAddressSchema, updateAddressSchema } = require("../validators/user");
const httpStatus = require("http-status");
const ApiError = require('../../../../utils/ApiError');

// Add New Address
router.patch("/addAddress", validate, validateBody(addAddressSchema), async (req, res) => {
    try {
        const addAddress = await addUserAddress(req, res);
        res.status(httpStatus.status.OK).json({ message: "User Address added successfully", addAddress: addAddress });
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }
});

// Update Address
router.patch("/updateAddress", validate, validateBody(updateAddressSchema), async (req, res) => {
    try {
        const updateAddress = await updateUserAddress(req, res);
        res.status(httpStatus.status.OK).json({ message: "User Address updated successfully", updatedAddress: updateAddress });
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }
});

module.exports = router;