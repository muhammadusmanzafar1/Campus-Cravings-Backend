'use strict';
const jwt = require('jsonwebtoken');
// const auth = require('config').get('auth');

exports.getAccessToken = (user, session) => {
     const claims = {
          session: session.id,
          user: user.id,
     };
     return jwt.sign(claims, process.env.SECRET_KEY, {
          expiresIn: `${process.env.TOKEN_PERIOD}m`,
     });
};

exports.getRefreshToken = (user) => {
     const claims = {
          user: user.id,
     };
     return jwt.sign(claims, process.env.REFRESH_KEY, {
          expiresIn: `${process.env.REFRESH_PERIOD}d`,
     });
};

exports.verifyToken = (token) => {
     return jwt.verify(token, process.env.SECRET_KEY);
};
