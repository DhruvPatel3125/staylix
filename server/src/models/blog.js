const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a blog title'],
        trim: true
    },
    content: {
        type: String,
        required: [true, 'Please provide blog content']
    },
    image: {
        type: String,
        required: [true, 'Please provide a blog image']
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    excerpt: {
        type: String,
        trim: true
    },
    sections: [{
        heading: {
            type: String,
            required: [true, 'Please provide a heading for the section']
        },
        content: {
            type: String,
            required: [true, 'Please provide content for the section']
        }
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Blog', blogSchema);
