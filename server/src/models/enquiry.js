const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide your name'],
            trim: true,
            maxLength: [100, 'Name cannot exceed 100 characters']
        },
        email: {
            type: String,
            required: [true, 'Please provide your email'],
            match: [
                /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                'Please add a valid email'
            ]
        },
        phone: {
            type: String,
            required: false,
            trim: true
        },
        subject: {
            type: String,
            required: [true, 'Please provide a subject'],
            trim: true,
            maxLength: [150, 'Subject cannot exceed 150 characters']
        },
        message: {
            type: String,
            required: [true, 'Please provide a message'],
            maxLength: [2000, 'Message cannot exceed 2000 characters']
        },
        ip_address: {
            type: String
        },
        user_agent: {
            type: String
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Enquiry', enquirySchema);
