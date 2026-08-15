const asyncHandler = require('../middleware/asyncHandler');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const uploadToCloudinary = require('../utils/uploadToCloudinary');
const sendEmail = require('../utils/sendEmail');
const passwordResetTemplate = require('../emailTemplates/passwordReset');
const crypto = require('crypto');

// @desc    Upload / replace the logged-in user's profile photo
// @route   PUT /api/v1/auth/avatar
// @access  Private
const updateAvatar = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ErrorResponse('Please upload an image file', 400));
  }

  const secureUrl = await uploadToCloudinary(req.file.buffer, 'expense-tracker/avatars');

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { avatarUrl: secureUrl },
    { new: true, runValidators: true }
  );

  res.status(200).json({ success: true, data: user });
});

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
const register = asyncHandler(async (req, res, next) => {
  const { email, password, firstName, lastName } = req.body;

  // Create user
  const user = await User.create({
    email,
    password,
    firstName,
    lastName
  });

  // Send welcome email
  try {
    console.log(`Sending welcome email to ${user.email}`);
    await sendEmail({
      email: user.email,
      subject: 'Welcome to Expense Tracker!',
      message: `Hi ${user.firstName},\n\nWelcome to Expense Tracker! We're excited to have you on board. Start tracking your income and expenses today.\n\nBest regards,\nThe Expense Tracker Team`,
      html: `<p>Hi ${user.firstName},</p><p>Welcome to Expense Tracker! We're excited to have you on board. Start tracking your income and expenses today.</p><p>Best regards,<br>The Expense Tracker Team</p>`
    });
    console.log('Welcome email sent successfully');
  } catch (emailError) {
    // Log email error but don't fail registration
    console.error('Welcome email failed:', emailError);
  }

  sendTokenResponse(user, 201, res);
});

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  }

  // Check for user
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  sendTokenResponse(user, 200, res);
});

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Forgot password
// @route   POST /api/v1/auth/forgotpassword
// @access  Public
const forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorResponse('There is no user with that email', 404));
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  // Create reset url
  const resetUrl = `${process.env.CLIENT_URL}/resetpassword/${resetToken}`;

  const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please visit: \n\n ${resetUrl}`;
  const html = passwordResetTemplate({ firstName: user.firstName, resetUrl });

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password reset token',
      message,
      html
    });

    res.status(200).json({ success: true, data: 'Email sent' });
  } catch (err) {
    console.log(err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponse('Email could not be sent', 500));
  }
});

// @desc    Reset password
// @route   PUT /v1/auth/resetpassword/:resettoken
// @access  Public
const resetPassword = asyncHandler(async (req, res, next) => {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) {
    return next(new ErrorResponse('Invalid token', 400));
  }

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// Helper function to get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  // Fall back to 30 days if JWT_COOKIE_EXPIRE is missing or not a valid number,
  // so a misconfigured .env can never produce an Invalid Date here.
  const cookieExpireDays = parseInt(process.env.JWT_COOKIE_EXPIRE, 10) || 30;

  const options = {
    expires: new Date(
      Date.now() + cookieExpireDays * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token
    });
};

module.exports = { register, login, getMe, forgotPassword, resetPassword, updateAvatar };