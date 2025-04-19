const express = require('express');
const router = express.Router();
const { validate } = require('../../../../middlewares/auth');
const { addUserAddress } = require('../controllers/userController');
const { validateBody } = require("../../../../middlewares/validate");
const { addAddressSchema } = require("../validators/user");
const httpStatus = require("http-status");
const ApiError = require('../../../../utils/ApiError');

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

module.exports = router;