const Enquiry = require('../models/enquiry');
const axios = require('axios');
const sendEmail = require('../utils/emailService');

exports.submitContactForm = async (req, res, next) => {
    try {
        const { name, email, phone, subject, message, recaptchaToken } = req.body;

        // Verify reCAPTCHA if token is provided and secret exists
        if (process.env.RECAPTCHA_SECRET_KEY && recaptchaToken) {
            const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`;
            const response = await axios.post(verifyUrl);
            const { success, score } = response.data;
            
            // v2 response only has success, v3 has score. Handle both securely.
            if (!success) {
                console.error('reCAPTCHA Verification Failed:', response.data);
                return res.status(400).json({ success: false, message: 'reCAPTCHA verification failed. Please try again.' });
            }
        } else if (process.env.NODE_ENV === 'production') {
            // Optional: enforce recaptcha in production if needed
            // return res.status(400).json({ success: false, message: 'reCAPTCHA token is required.' });
        }

        // Capture IP and User Agent
        const ip_address = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const user_agent = req.headers['user-agent'];

        // Create Enquiry
        const enquiry = await Enquiry.create({
            name,
            email,
            phone,
            subject,
            message,
            ip_address,
            user_agent
        });

        // Send Email Notification
        const emailContent = `
            <h3>New Contact Enquiry</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong></p>
            <p>${message}</p>
            <br/>
            <p><em>Submitted from IP: ${ip_address}</em></p>
        `;

        try {
            await sendEmail({
                email: 'info@staylix.com',
                subject: `New Enquiry: ${subject}`,
                message: `New Enquiry from ${name} (${email}). Subject: ${subject}. Message: ${message}`,
                html: emailContent
            });
        } catch (emailError) {
            console.error('Failed to send notification email:', emailError);
            // We don't fail the request if email fails, but log it.
        }

        res.status(201).json({
            success: true,
            message: 'Your message has been sent successfully.',
            data: enquiry
        });
    } catch (error) {
        next(error);
    }
};

exports.getEnquiries = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const startIndex = (page - 1) * limit;

        // Search support
        const keyword = req.query.keyword
            ? {
                  $or: [
                      { name: { $regex: req.query.keyword, $options: 'i' } },
                      { email: { $regex: req.query.keyword, $options: 'i' } },
                      { subject: { $regex: req.query.keyword, $options: 'i' } }
                  ]
              }
            : {};

        const total = await Enquiry.countDocuments(keyword);
        const enquiries = await Enquiry.find(keyword)
            .sort({ createdAt: -1 })
            .skip(startIndex)
            .limit(limit);

        res.status(200).json({
            success: true,
            count: enquiries.length,
            pagination: {
                page,
                limit,
                total
            },
            data: enquiries
        });
    } catch (error) {
        next(error);
    }
};

exports.getEnquiry = async (req, res, next) => {
    try {
        const enquiry = await Enquiry.findById(req.params.id);

        if (!enquiry) {
            return res.status(404).json({
                success: false,
                message: 'Enquiry not found'
            });
        }

        res.status(200).json({
            success: true,
            data: enquiry
        });
    } catch (error) {
        next(error);
    }
};
