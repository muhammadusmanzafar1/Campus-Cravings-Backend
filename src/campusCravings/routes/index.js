// src/campusCravings/routes/index.js
const express = require("express");
const router = express.Router();
const { validate } = require('../../../middlewares/auth')

const category = require("../restaurant/routes/categoryRoutes");
const restaurant = require("../restaurant/routes/restaurantRoutes");
const rider = require('../rider/routers/rider')

router.use("/categories", validate, category);
router.use("/restaurants", validate, restaurant);
router.use("/rider", validate, rider);

module.exports = router;
