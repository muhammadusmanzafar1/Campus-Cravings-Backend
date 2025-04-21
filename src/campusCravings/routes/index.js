// src/campusCravings/routes/index.js
const express = require("express");
const router = express.Router();
const { validate } = require('../../../middlewares/auth')

const auth = require("../../auth/routes/authRoute");
const category = require("../restaurant/routes/categoryRoutes");
const restaurant = require("../restaurant/routes/restaurantRoutes");
const user = require("../users/routes/userRoute");
const admin = require("../admin/routes/adminRoute");

router.use("/auth", auth);
router.use("/categories", validate, category);
router.use("/restaurants", validate, restaurant);
router.use("/user", validate, user);
router.use("/admin", validate, admin);

module.exports = router;
