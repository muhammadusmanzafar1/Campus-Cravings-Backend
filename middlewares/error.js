const httpStatus = require("http-status");
const mongoose = require("mongoose");
const ApiError = require("../utils/ApiError");

// Ensure the config is correctly loaded (using dotenv if no config is present)
require('dotenv').config();  // If you're using dotenv
const config = {
    env: process.env.NODE_ENV || 'development',  // Default to 'development' if NODE_ENV is not set
};

const errorConverter = (err, req, res, next) => {
    let error = err;
    
    if (!(error instanceof ApiError)) {
        const statusCode = error.statusCode || (error instanceof mongoose.Error
            ? httpStatus.BAD_REQUEST
            : httpStatus.INTERNAL_SERVER_ERROR);
        
        const message = error.message || httpStatus[statusCode];
        error = new ApiError(message, statusCode, false, err.stack);
    }
    
    // Pass the error to the next middleware (error handler)
    next(error);
};

const errorHandler = (err, req, res, next) => {
    if (config.env === "production" && !err.isOperational) {
        err.code = httpStatus.INTERNAL_SERVER_ERROR;
        err.message = httpStatus[httpStatus.INTERNAL_SERVER_ERROR];
    }

    res.locals.errorMessage = err.message;

    const response = {
        isSuccess: false,
        statusCode: err.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
        message: err.message || httpStatus[err.statusCode || httpStatus.INTERNAL_SERVER_ERROR],
        stack: config.env === "development" ? err.stack : undefined, 
    };

    if (!res.failure) {
        return res.status(response.statusCode).send(response);
    }

    return res.failure(err);  
};

module.exports = {
    errorConverter,
    errorHandler,
};
