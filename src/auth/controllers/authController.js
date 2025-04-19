'use strict'
const authService = require('../services/auth')
const asyncHandler = require('express-async-handler')
const moment = require('moment')
const sessionService = require('../services/session');


exports.registerUser = asyncHandler(async (req, res) => {
    let user = await authService.registerWithEmail(req.body);
    return user;
});

exports.registerViaPhone = asyncHandler(async (req, res) => {
    let user = await authService.registerWithPhone(req.body);
    return user;
})

exports.verifyOTP = asyncHandler(async (req, res) => {
    let user = await authService.verifyOTP(req.body);
    user.deviceId = req.body.deviceId;
    user.deviceType = req.body.deviceType;
    const session = await sessionService.createSession(user, req.body);
    const responseData = {
        ...user.toObject(), 
        accessToken: session.accessToken,
        refreshToken: session.refreshToken
    };
    res.cookie('refreshToken', user.refreshToken, {
         secure: false,
         httpOnly: true,
        });
        return responseData;

});


exports.login = asyncHandler(async (req, res) => {
    let user = await authService.login(req.body);
    user.deviceId = req.body.deviceId;
    user.deviceType = req.body.deviceType;

    const session = await sessionService.createSession(user, req.body);

    user.lastAccess = moment.utc();
    user = await user.save();

    const responseData = {
        ...user.toObject(),
        accessToken: session.accessToken,
        refreshToken: session.refreshToken

    };
    const option = {
        secure: process.env.NODE_ENV == 'prod',
        httpOnly: true,
    };
    res.cookie('refreshToken', session.refreshToken, option).cookie(
        'accessToken',
        session.accessToken,
        option
    );
    return responseData;
});