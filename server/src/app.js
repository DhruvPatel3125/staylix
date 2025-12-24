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
app.use('/uploads', express.static('uploads'));


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

app.get('/',(req,res)=>{
    res.send("Welcome to Staylix")
})

app.use((err, req, res, next) => {
    console.error("ERROR:", err.message);
    const statusCode = err.statusCode || err.status || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error"
    });
})

module.exports = app;