const express = require('express');

const router = express.Router();
const { 
  register, 
  login, 
  getMe, 
  forgotPassword, 
  resetPassword,
  verifyOTP,
  verifyResetOTP
} = require('../controllers/authController')
const { protect } = require('../middlewares/authMiddleWare')
const upload = require('../middlewares/uploadMiddleware')

router.post('/register', upload.single('profileImage'), register)
router.post('/verify-otp', verifyOTP)
router.post('/login', login)
router.get('/me', protect, getMe)
router.post('/forgotpassword', forgotPassword);
router.post('/verify-reset-otp', verifyResetOTP);
router.put('/resetpassword/:resetToken', resetPassword);


module.exports = router;