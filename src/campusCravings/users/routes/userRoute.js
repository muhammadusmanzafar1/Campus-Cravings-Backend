const express = require('express');
const router = express.Router();
const { addUserAddress, updateUserAddress, getUser, updateUser, getUserTickets, getAllusers,
    createNewUser, delUser, getUserAllOrders, getUserDetail
 } = require('../controllers/userController');
const { validateBody } = require("../../../../middlewares/validate");
const { registerViaEmail } = require('../../../auth/validators/auth')
const { addAddressSchema, updateAddressSchema, updateUserSchema } = require("../validators/user");
const httpStatus = require("http-status");
const ApiError = require('../../../../utils/ApiError');

// Get All Users
router.get('/getAllUsers', async (req, res) => {
    try {
        const users = await getAllusers(req, res);
        res.status(httpStatus.status.OK).json({ 
            isSuccess: true,
            message: "Users fetched successfully",
            data: users 
        });
        } catch (error) {
            return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
            }
        });
// Get User Info
router.get("/", async (req, res) => {
    try {
        const user = await getUser(req, res);
        res.status(httpStatus.status.OK).json({ message: "User data fetched successfully", userInfo: user });
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }
});

// Update User Info
router.patch("/", validateBody(updateUserSchema), async (req, res) => {
    try {
        const user = await updateUser(req, res);
        res.status(httpStatus.status.OK).json({ message: "User data updated successfully", userInfo: user });
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }
});

// Add New Address
router.patch("/addAddress", validateBody(addAddressSchema), async (req, res) => {
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
router.patch("/updateAddress", validateBody(updateAddressSchema), async (req, res) => {
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

// Get User tickets
router.get("/tickets", async (req, res) => {
    try {
        const tickets = await getUserTickets(req, res);
        res.status(httpStatus.status.OK).json({ message: "Tickets Fetch Successfully", tickets: tickets });
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }
});

router.post("/addUser", async (req, res)=> {
    const { error, value } = registerViaEmail.body.validate(req.body, { abortEarly: false });

    if (error) {
        return res.status(httpStatus.status.BAD_REQUEST).json({
            message: "Validation Error",
            errors: error.details.map(err => err.message),
        });
    }
    try {
        const user = await createNewUser(req, res);
        res.status(httpStatus.status.CREATED).json({
            isSuccess: true,
            message: "New User Created Successfully",
            data: user
        });
    } catch (error) {
        console.error(error)
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }
});

router.delete('/deleteUser/:id', async (req, res) => {
    try {
        const user = await delUser(req, res);
        res.status(httpStatus.status.CREATED).json({
            isSuccess: true,
            message: "User Deleted Successfully",
            data: user
        });
    } catch (error) {
        console.error(error)
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }
})

// Get All Order
// Get all orders with respect to User id
router.get("/orders", async (req, res) => {
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


router.get('/getuser/:id', async (req, res) => {
    try {
        const getUserD = await getUserDetail(req, res);
        res.status(httpStatus.status.OK).json({ 
            isSuccess: true,
            message: "Detail fetched", 
            data: getUserD 
        });
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }
})

module.exports = router;