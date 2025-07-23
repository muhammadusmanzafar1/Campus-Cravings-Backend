'use strict';
const httpStatus = require('http-status');

const createSocketAuthError = (message, code = httpStatus.UNAUTHORIZED) => {
  const error = new Error(message);
  error.data = { code };
  return error;
};

module.exports = { createSocketAuthError };