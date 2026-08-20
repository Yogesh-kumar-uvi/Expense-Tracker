const asyncHandler = require('../middleware/asyncHandler');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const uploadToCloudinary = require('../utils/uploadToCloudinary');
const sendEmail = require('../utils/sendEmail');
const passwordResetTemplate = require('../emailTemplates/passwordReset');
const crypto = require('crypto');

const setAccessTokenCookie = (user, res) => {
  const accessToken = user.getSignedAccessToken();

  const options = {
    expires: new Date(
      Date.now() +
        parseInt(process.env.JWT_COOKIE_EXPIRE, 10) *
          24 *
          60 *
          60 *
          1000
    ),
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/'
  };

  res.cookie('accessToken', accessToken, options);
};

const setRefreshTokenCookie = (user, res) => {
  const refreshToken = user.getSignedRefreshToken();

  const options = {
    expires: new Date(
      Date.now() +
        parseInt(process.env.JWT_REFRESH_EXPIRE, 10) *
          24 *
          60 *
          60 *
          1000
    ),
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/'
  };

  res.cookie('refreshToken', refreshToken, options);
};

const updateAvatar = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(
      new ErrorResponse('Please upload an image file', 400)
    );
  }

  const secureUrl = await uploadToCloudinary(
    req.file.buffer,
    'expense-tracker/avatars'
  );

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { avatarUrl: secureUrl },
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    success: true,
    data: user
  });
});

const register = asyncHandler(async (req, res, next) => {
  const {
    email,
    password,
    firstName,
    lastName
  } = req.body;

  const user = await User.create({
    email,
    password,
    firstName,
    lastName
  });

  try {
    console.log(`Sending welcome email to ${user.email}`);

    await sendEmail({
      email: user.email,
      subject: 'Welcome to Expense Tracker!',
      message: `Hi ${user.firstName},

Welcome to Expense Tracker! We're excited to have you on board. Start tracking your income and expenses today.

Best regards,
The Expense Tracker Team`,
      html: `<p>Hi ${user.firstName},</p>
<p>Welcome to Expense Tracker! We're excited to have you on board. Start tracking your income and expenses today.</p>
<p>Best regards,<br>The Expense Tracker Team</p>`
    });

    console.log('Welcome email sent successfully');
  } catch (emailError) {
    console.error('Welcome email failed:', emailError);
  }

  setAccessTokenCookie(user, res);
  setRefreshTokenCookie(user, res);

  res.status(201).json({
    success: true,
    data: {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    }
  });
});

const login = asyncHandler(async (req, res, next) => {
  const {
    email,
    password
  } = req.body;

  if (!email || !password) {
    return next(
      new ErrorResponse(
        'Please provide an email and password',
        400
      )
    );
  }

  const user = await User.findOne({ email }).select(
    '+password'
  );

  if (!user) {
    return next(
      new ErrorResponse(
        'Invalid credentials',
        401
      )
    );
  }

  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(
      new ErrorResponse(
        'Invalid credentials',
        401
      )
    );
  }

  setAccessTokenCookie(user, res);
  setRefreshTokenCookie(user, res);

  res.status(200).json({
    success: true,
    data: {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    }
  });
});

const getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user
  });
});

const forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({
    email: req.body.email
  });

  if (!user) {
    return next(
      new ErrorResponse(
        'There is no user with that email',
        404
      )
    );
  }

  const resetToken = user.getResetPasswordToken();

  await user.save({
    validateBeforeSave: false
  });

  const resetUrl = `${process.env.CLIENT_URL}/resetpassword/${resetToken}`;

  const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please visit:

${resetUrl}`;

  const html = passwordResetTemplate({
    firstName: user.firstName,
    resetUrl
  });

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password reset token',
      message,
      html
    });

    res.status(200).json({
      success: true,
      data: 'Email sent'
    });
  } catch (err) {
    console.log(err);

    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save({
      validateBeforeSave: false
    });

    return next(
      new ErrorResponse(
        'Email could not be sent',
        500
      )
    );
  }
});

const resetPassword = asyncHandler(async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpires: {
      $gt: Date.now()
    }
  });

  if (!user) {
    return next(
      new ErrorResponse(
        'Invalid token',
        400
      )
    );
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();

  setAccessTokenCookie(user, res);
  setRefreshTokenCookie(user, res);

  res.status(200).json({
    success: true,
    data: {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    }
  });
});

module.exports = {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  updateAvatar
};