const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const cors = require("cors");
const morgan = require('morgan');

const authRoutes = require('./routes/authRoute')
const userRoutes = require('./routes/userRoutes')
const hotelRoutes = require('./routes/hotelRoutes')
const roomRoutes = require('./routes/roomRoutes')
const bookingRoutes = require('./routes/bookingRoutes')
const reviewRoutes = require('./routes/reviewRoutes')
const ownerRequestRoutes = require('./routes/ownerRequestRoutes')
const adminRoutes = require('./routes/adminRoutes')
const discountRoutes = require('./routes/discountRoutes')
const wishlistRoutes = require('./routes/wishlistRoutes')
const chatbotRoutes = require('./routes/chatbotRoute')



const app = express();

const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? [process.env.FRONTEND_URL]
  : [/localhost:\d+$/, 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'];

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({extended:true}));
// app.use('/uploads', express.static('uploads'));


if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
}

app.use("/api/auth",authRoutes)
app.use('/api/users',userRoutes);
app.use('/api/hotels',hotelRoutes);
app.use('/api/rooms',roomRoutes);
app.use('/api/bookings',bookingRoutes);
app.use('/api/reviews',reviewRoutes);
app.use('/api/owner-request',ownerRequestRoutes);
app.use('/api/admin',adminRoutes);
app.use('/api/discounts',discountRoutes);
app.use("/api",wishlistRoutes)
app.use('/api/chat', chatbotRoutes);



app.get('/',(req,res)=>{
    res.send("Welcome to Staylix")
})

app.use((err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log to console for dev
    if (process.env.NODE_ENV === 'development') {
        console.error("ERROR:", err);
    }

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = `Resource not found with id of ${err.value}`;
        error = { message, statusCode: 404 };
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        const message = `${field === 'email' ? 'Email' : field} already exists`;
        error = { message, statusCode: 400 };
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const errors = {};
        Object.values(err.errors).forEach((val) => {
            errors[val.path] = val.message;
        });
        error = { 
            message: 'Validation failed', 
            errors, 
            statusCode: 400 
        };
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        error = { message: 'Not authorized', statusCode: 401 };
    }
    if (err.name === 'TokenExpiredError') {
        error = { message: 'Token expired', statusCode: 401 };
    }

    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: error.message || "Internal Server Error",
        errors: error.errors || undefined
    });
});

module.exports = app;