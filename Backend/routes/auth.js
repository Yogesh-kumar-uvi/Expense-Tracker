const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');

const {
    register,
    login,
    getMe,
    forgotPassword,
    resetPassword,
    updateAvatar,
    logout
} = require('../controllers/auth');

const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: {
        success: false,
        error: 'Too many attempts from this IP. Please try again in 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

router.route('/register').post(authLimiter, register);

router.route('/login').post(authLimiter, login);

router.route('/logout').post(logout);

router.route('/me').get(protect, getMe);

router.route('/avatar').put(
    protect,
    upload.single('avatar'),
    updateAvatar
);

router.route('/forgotpassword').post(
    authLimiter,
    forgotPassword
);

router.route('/resetpassword/:resettoken').put(
    authLimiter,
    resetPassword
);

module.exports = router;