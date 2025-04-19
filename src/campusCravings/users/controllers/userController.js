'use strict';
const userService = require('../services/user');
const asyncHandler = require('express-async-handler');

exports.getUser = asyncHandler(async (req, res) => {
    const user = await userService.getUser(req);
    return user;
})

exports.updateUser = asyncHandler(async (req, res) => {
    const user = await userService.updateUser(req);
    return user;
})

exports.addUserAddress = asyncHandler(async (req, res) => {
    const user = await userService.addUserAddress(req);
    return user;
});

exports.updateUserAddress = asyncHandler(async (req, res) => {
    const user = await userService.updateUserAddress(req);
    return user;
});