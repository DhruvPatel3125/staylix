const mongoose = require('mongoose');
const app = require('./app');
const dotenv = require('dotenv');

dotenv.config();

const port = process.env.PORT || 3001;

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true })
    .then(() => {
        console.log("Connected to MongoDB");
        app.listen(port);
    })
    .catch(err => {
        console.error(`Error connecting to database ${err}`);
    })
