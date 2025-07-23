'use strict';
const httpStatus = require('http-status');
const jwtHelper = require('../../../utils/jwt');
const sessionService = require('../../auth/services/session');
const userDB = require('../../auth/models/user');
const { createSocketAuthError } = require('../utils/socketError');

/**
 * 
 * @param {*} token 
 * @returns 
 */
const tokenValidator = async (token) => {
  try {
    return jwtHelper.verifyToken(token);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw createSocketAuthError('Token expired');
    }
    throw createSocketAuthError(err.message || 'Invalid token');
  }
};

/**
 * 
 * @param {*} sessionId 
 * @returns 
 */
const sessionValidator = async (sessionId) => {
  const session = await sessionService.get(sessionId);
  if (!session) throw createSocketAuthError('Session not found');
  if (session.status === 'expired') throw createSocketAuthError('Session expired');
  return session;
};

/**
 * 
 * @param {*} userId 
 * @returns 
 */
const userValidator = async (userId) => {
  const user = await userDB.findById(userId);
  if (!user) throw createSocketAuthError('User not found');
  if (user.status === 'inactive') throw createSocketAuthError('User status is inactive');
  if (user.status === 'deleted') throw createSocketAuthError('User status is deleted');
  if (user.status === 'blocked') throw createSocketAuthError('User status is blocked');
  return user;
};

const validateSocketAuth = async (token) => {
  if (!token) throw createSocketAuthError('Token not found');

  const claims = await tokenValidator(token);
  const session = await sessionValidator(claims.session);
  const user = await userValidator(claims.user);

  return { user, session, claims };
};

module.exports = { validateSocketAuth };