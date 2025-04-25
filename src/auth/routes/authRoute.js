const express = require("express");
const router = express.Router();
const httpStatus = require("http-status");
const ApiError = require('../../../utils/ApiError');
const { registerUser, verifyOTP, login, registerViaPhone, resendOTP, handleForgotPassword, handleResetPassword, handleLogout } = require('../controllers/authController')
const { registerViaEmail, validateVerifyOTP, loginVerify, registerViaPhone: registerViaPhones,
    resendOtp, forgotPassword, updatePassword, resetPassword } = require("../validators/auth");
const { validate } = require('../../../middlewares/auth')

// RegisterWithEmail
router.post("/register/email", async (req, res) => {
    const { error, value } = registerViaEmail.body.validate(req.body, { abortEarly: false });

    if (error) {
        return res.status(httpStatus.status.BAD_REQUEST).json({
            message: "Validation Error",
            errors: error.details.map(err => err.message),
        });
    }

    try {
        const registeredUser = await registerUser(req, res);
        res.status(httpStatus.status.CREATED).json({ message: "User registered successfully", user: registeredUser });
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ message: error.message });
        }

        return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }
});

//RegisterWithPhone
router.post("/register/phone", async (req, res) => {
    const { error, value } = registerViaPhones.body.validate(req.body, { abortEarly: false });
    if (error) {
        return res.status(httpStatus.status.BAD_REQUEST).json({
            message: "Validation Error",
            errors: error.details.map(err => err.message),
        });
    }
    try {
        const registeredUser = await registerViaPhone(req, res);
        res.status(httpStatus.status.CREATED).json({ message: "User registered successfully", user: registeredUser });
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }
})

// VerifyOTP
router.post("/verifyOTP", async (req, res) => {
    const { error, value } = validateVerifyOTP.body.validate(req.body, { abortEarly: false });

    if (error) {
        return res.status(httpStatus.status.BAD_REQUEST).json({
            message: "Validation Error",
            errors: error.details.map(err => err.message),
        });
    }
    try {
        const data = await verifyOTP(req, res);
        res.status(httpStatus.status.OK).json({ message: "User verified successfully", data: data });
    } catch (error) {
        console.error(error)
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ message: error.message });
        }

        return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }
});

//Login
router.post("/login", async (req, res) => {
    const { error, value } = loginVerify.body.validate(req.body, { abortEarly: false });

    if (error) {
        return res.status(httpStatus.status.BAD_REQUEST).json({
            message: "Validation Error",
            errors: error.details.map(err => err.message),
        });
    }

    try {
        const registeredUser = await login(req, res);
        res.status(httpStatus.status.CREATED).json({ message: "User Login successfully", user: registeredUser });
    } catch (error) {
        console.error(error)
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ message: error.message });
        }

        return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }

});

//Resend OTP
router.post("/resendOTP", async (req, res) => {
    const { error, value } = resendOtp.body.validate(req.body, { abortEarly: false });
    if (error) {
        return res.status(httpStatus.status.BAD_REQUEST).json({
            message: "Validation Error",
            errors: error.details.map(err => err.message),
        });
    }
    try {
        const data = await resendOTP(req, res);
        res.status(httpStatus.status.OK).json({ message: "OTP Resend successfully", data: data });
    } catch (error) {
        console.error(error)
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }
});


router.post('/forgotPassword', async (req, res) => {
    const { error, value } = forgotPassword.body.validate(req.body, { abortEarly: false });
    if (error) {
        return res.status(httpStatus.status.BAD_REQUEST).json({ message: "Validation Error", errors: error.details.map(err => err.message), });
    }
    try {
        const result = await handleForgotPassword(req, res);
        res.status(httpStatus.status.OK).json({ message: "Password reset link sent successfully", result });
    } catch (error) {
        console.error(error);
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }
});

router.put('/updatePassword/:id', async (req, res) => {
    const { error, value } = updatePassword.body.validate(req.body, { abortEarly: false });
    if (error) {
        return res.status(httpStatus.status.BAD_REQUEST).json({ message: "Validation Error", errors: error.details.map(err => err.message), });
    }
    try {
        const result = await handleUpdatePassword(req.params.id, req.body);
        res.status(httpStatus.status.OK).json({ message: "Password updated successfully", result });
    } catch (error) {
        console.error(error); if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }
});

router.post('/resetPassword/:id', async (req, res) => {
    const { error, value } = resetPassword.body.validate(req.body, { abortEarly: false });
    if (error) {
        return res.status(httpStatus.status.BAD_REQUEST).json({ message: "Validation Error", errors: error.details.map(err => err.message), });
    }
    try {
        const result = await handleResetPassword(req.params.id, req.body);
        res.status(httpStatus.status.OK).json({ message: "Password reset successfully", result });
    } catch (error) {
        console.error(error);
        if (error instanceof ApiError) { return res.status(error.statusCode).json({ message: error.message }); } return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }
});

router.post('/logout', validate, async (req, res) => {
    try {
        const result = await handleLogout(req);
        res.status(httpStatus.status.OK).json({ message: "User Logout successfully", result });
    } catch (error) {
        console.error(error);
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(httpStatus.status.INTERNAL_SERVER_ERROR).json({ message: error.message || "Server Error" });
    }
});


module.exports = router;
