// src/campusCravings/routes/index.js
const express = require("express");
const router = express.Router();
const { validate } = require('../../../middlewares/auth')

const category = require("../restaurant/routes/categoryRoutes");
const restaurant = require("../restaurant/routes/restaurantRoutes");

router.use("/categories", validate, category);
router.use("/restaurants", validate, restaurant);

module.exports = router;
