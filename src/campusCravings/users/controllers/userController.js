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

exports.getUserTickets = async (req, res) => {
    const tickets = await userService.getUserTickets(req);
    return tickets;
};

exports.getAllusers = asyncHandler(async (req, res) => {
    const users = await userService.getAllUsers(req, res);
    return users;
});

exports.createNewUser = asyncHandler(async (req, res) => {
    const users = await userService.newUser(req);
    return users;
});

exports.delUser = asyncHandler(async (req, res) => {
    const data = await userService.deleteUser(req, res);
    return data;
})

// User All Orders
exports.getUserAllOrders = asyncHandler(async (req, res) => {
    const orders = await userService.getUserAllOrders(req);
    return orders;
});