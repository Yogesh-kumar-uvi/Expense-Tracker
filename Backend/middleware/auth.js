const asyncHandler = require('./asyncHandler');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

// Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
  const token = req.cookies.accessToken;

  // Make sure token exists
  if (!token) {
    return next(
      new ErrorResponse('Not authorized to access this route', 401)
    );
  }

  try {
    // Verify access token using the access-token secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return next(
        new ErrorResponse('Not authorized to access this route', 401)
      );
    }

    next();
  } catch (err) {
    return next(
      new ErrorResponse('Not authorized to access this route', 401)
    );
  }
});

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }

    next();
  };
};