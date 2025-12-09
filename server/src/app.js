const express = require('express');
const dotenv = require('dotenv');
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

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));


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

app.get('/',(req,res)=>{
    res.send("Welcome to Staylix")
})

app.use((err,req,res,next)=>{
    console.log("ERROR:",err.message);
    res.status(err.statusCode || 500).json({
        success:false,
        message: err.message || "Internal Server Error" 
    })
})

module.exports = app;