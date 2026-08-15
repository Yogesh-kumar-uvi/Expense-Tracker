const express = require('express');
const router = express.Router();
const { register, login, getMe, forgotPassword, resetPassword, updateAvatar } = require('../controllers/auth');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/me').get(protect, getMe);
router.route('/avatar').put(protect, upload.single('avatar'), updateAvatar);
router.route('/forgotpassword').post(forgotPassword);
router.route('/resetpassword/:resettoken').put(resetPassword);

module.exports = router;