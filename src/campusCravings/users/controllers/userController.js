'use strict';
const userService = require('../services/user');
const asyncHandler = require('express-async-handler');

exports.addUserAddress = asyncHandler(async (req, res) => {
    const user = await userService.addUserAddress(req);
    return user;
});

exports.updateUserAddress = asyncHandler(async (req, res) => {
    const user = await userService.updateUserAddress(req);
    return user;
});