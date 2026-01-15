const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    passwordHash: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'owner'],
        default: 'user'
    },
    phone: {
        type: Number,
    },
    isBlocked: {
        type: Boolean,
        default: false,
    },
    isApproved: {
        type: Boolean,
        default: false,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,

}, {
    timestamps: true,
})

userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.passwordHash);
};

// Generate and hash password reset token
userSchema.methods.getResetPasswordToken = function () {
    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Set expire (10 minutes)
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

module.exports = mongoose.model("User", userSchema);