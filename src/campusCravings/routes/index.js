// src/campusCravings/routes/index.js
const express = require("express");
const router = express.Router();
const { validate } = require('../../../middlewares/auth')

const auth = require("../../auth/routes/authRoute");
const category = require("../restaurant/routes/categoryRoutes");
const restaurant = require("../restaurant/routes/restaurantRoutes");
const rider = require('../rider/routers/rider')
const user = require("../users/routes/userRoute");
const admin = require("../admin/routes/adminRoute");
const conversation = require("../users/routes/conversationRoute");

router.use("/auth", auth);
router.use("/categories", validate, category);
router.use("/restaurants", validate, restaurant);
router.use("/rider", validate, rider);
router.use("/user", validate, user);
router.use("/admin", validate, admin);
router.use("/conversation", validate, conversation);

module.exports = router;
