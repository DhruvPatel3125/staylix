const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });
const http = require('http');
const app = require('./app');
const { initSocket } = require('./socket');

const port = process.env.PORT || 3001;

// Create HTTP server from express app
const httpServer = http.createServer(app);

// Initialize Socket.io
initSocket(httpServer);

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("Connected to MongoDB");
        httpServer.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
    })
    .catch(err => {
        console.error(`Error connecting to database: ${err.message}`);
        process.exit(1);
    })
