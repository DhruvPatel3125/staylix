const express = require('express');
const {
    submitContactForm,
    getEnquiries,
    getEnquiry
} = require('../controllers/contactController');
const { protect, admin } = require('../middlewares/authMiddleware');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting for the contact endpoint to prevent spam
const contactLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: {
        success: false,
        message: 'Too many contact requests from this IP, please try again after 15 minutes'
    }
});

// Public route for submitting contact form
router.post('/', contactLimiter, submitContactForm);

// Admin routes for managing enquiries
router.get('/', protect, admin, getEnquiries);
router.get('/:id', protect, admin, getEnquiry);

module.exports = router;
