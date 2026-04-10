const express = require('express');

const router = express.Router();
const { 
  register, 
  login, 
  getMe, 
  forgotPassword, 
  resetPassword,
  verifyOTP,
  verifyResetOTP,
  googleLogin
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
router.post('/google', googleLogin);


module.exports = router;
//add a 