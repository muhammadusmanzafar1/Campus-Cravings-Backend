const ApiError = require("./ApiError");
const httpStatus = require("http-status");

function authorizeUser(user, options = {}) {
  if (!user) {
    throw new ApiError('User not authenticated', httpStatus.status.UNAUTHORIZED);
  }

  const { requireAdmin } = options;

  const checks = [];

  if (requireAdmin) checks.push(user.isAdmin);

  if (checks.some(check => check)) {
    return true;
  }

  throw new ApiError('Access denied: insufficient privileges', httpStatus.status.FORBIDDEN);
}

module.exports = authorizeUser;
