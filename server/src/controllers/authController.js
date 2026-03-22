const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../utils/emailService");

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long"
      });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Email already exists"
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    const user = await User.create({
      name,
      email,
      passwordHash,
      role: role || "user",
      profileImage: req.file ? req.file.path : '',
      isVerified: false,
      otp,
      otpExpires
    });

    // Send OTP Email
    try {
      await sendEmail({
        email: user.email,
        subject: "Staylix - Verification Code",
        message: `Your account verification code is: ${otp}. It expires in 10 minutes.`,
        html: `
          <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <h2 style="color: #6366f1; text-align: center;">Welcome to Staylix!</h2>
            <p style="font-size: 16px; color: #1e293b;">Thank you for choosing Staylix. Please use the following code to verify your account:</p>
            <div style="background: #f8fafc; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
              <h1 style="font-size: 32px; letter-spacing: 5px; color: #1e293b; margin: 0;">${otp}</h1>
            </div>
            <p style="font-size: 14px; color: #64748b; text-align: center;">This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
          </div>
        `
      });

      res.status(201).json({
        success: true,
        message: "Registration successful. Please check your email for the verification code.",
        email: user.email
      });
    } catch (err) {
      console.error("Email send error during registration:", err);
      // Delete user if email fails so they can retry
      await User.findByIdAndDelete(user._id);
      return res.status(500).json({
        success: false,
        message: "Failed to send verification email. Please try again."
      });
    }
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({
      success: false,
      message: "Server error during registration. Please try again."
    });
  }
};


// @desc    Verify Registration OTP
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP are required" });
    }

    const user = await User.findOne({ 
      email, 
      otp, 
      otpExpires: { $gt: Date.now() } 
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, profileImage: user.profileImage }
    });
  } catch (err) {
    console.error("OTP Verification error:", err);
    res.status(500).json({ success: false, message: "Server error during verification" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email address before logging in",
        isUnverified: true
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Your account has been blocked"
      });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, profileImage: user.profileImage }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({
      success: false,
      message: "Server error during login. Please try again."
    });
  }
};


exports.getMe = async (req, res) => {
  try {

    res.json({
      success: true,
      user: req.user
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch user"
    });
  }
};

// @desc    Forgot Password (OTP Based)
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({ success: false, message: "There is no user with that email" });
    }

    // Generate 6-digit OTP for reset
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Hash OTP to store in resetPasswordToken (standard practice)
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(otp)
      .digest('hex');

    // Set expire (10 minutes)
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    await user.save({ validateBeforeSave: false });

    try {
      await sendEmail({
        email: user.email,
        subject: "Staylix - Password Reset Code",
        message: `Your password reset code is: ${otp}`,
        html: `
          <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <h2 style="color: #6366f1; text-align: center;">Password Reset Request</h2>
            <p style="font-size: 16px; color: #1e293b;">You requested to reset your password. Please use the following 6-digit code:</p>
            <div style="background: #f8fafc; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
              <h1 style="font-size: 32px; letter-spacing: 5px; color: #1e293b; margin: 0;">${otp}</h1>
            </div>
            <p style="font-size: 14px; color: #64748b; text-align: center;">This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
          </div>
        `
      });

      res.status(200).json({ success: true, message: "Reset code sent to email" });
    } catch (err) {
      console.error(err);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({ success: false, message: "Email could not be sent" });
    }
  } catch (err) {
    next(err);
  }
};


// @desc    Verify Reset OTP
// @route   POST /api/auth/verify-reset-otp
// @access  Public
exports.verifyResetOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP are required" });
    }

    const hashedOtp = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");

    const user = await User.findOne({
      email,
      resetPasswordToken: hashedOtp,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    res.status(200).json({ 
      success: true, 
      message: "OTP verified. You can now reset your password.",
      resetToken: hashedOtp // This will be used for the final reset call
    });
  } catch (err) {
    console.error("Reset OTP Verification error:", err);
    res.status(500).json({ success: false, message: "Server error during verification" });
  }
};

// @desc    Reset Password
// @route   PUT /api/auth/resetpassword/:resetToken
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    // resetToken here is the hashedOtp returned from verifyResetOTP
    const resetPasswordToken = req.params.resetToken;

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired session" });
    }

    // Set new password
    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(req.body.password, salt);

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(200).json({
      success: true,
      message: "Password reset successful",
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    next(err);
  }
};

