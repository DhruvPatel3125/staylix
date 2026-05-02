require('dotenv').config();
const cloudinary = require('./src/config/cloudinary');

async function testUpload() {
    try {
        const url = 'https://images.unsplash.com/photo-1566073771259-6a8506099945'; // Verified working
        console.log('Attempting upload for:', url);
        const result = await cloudinary.uploader.upload(url, {
            folder: 'staylix/test'
        });
        console.log('Success:', result.secure_url);
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testUpload();
