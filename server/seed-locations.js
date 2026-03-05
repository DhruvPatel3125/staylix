const mongoose = require('mongoose');
const Hotel = require('./src/models/hotel');
require('dotenv').config();

const { getCoordinates } = require('./src/utils/geocoder');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const seedLocations = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const hotels = await Hotel.find({});
        console.log(`Found ${hotels.length} hotels to update.`);

        for (let i = 0; i < hotels.length; i++) {
            const city = hotels[i].address?.city;
            console.log(`Geocoding ${hotels[i].name} in ${city}...`);

            const coords = await getCoordinates(hotels[i].address);

            if (coords) {
                // Add a small random offset so multiple hotels in the same city don't overlap perfectly
                const lngOffset = (Math.random() - 0.5) * 0.01;
                const latOffset = (Math.random() - 0.5) * 0.01;

                hotels[i].location = {
                    type: 'Point',
                    coordinates: [coords[0] + lngOffset, coords[1] + latOffset]
                };
                await hotels[i].save();
                console.log(`✅ Updated hotel: ${hotels[i].name} with coords [${hotels[i].location.coordinates}]`);
            } else {
                console.log(`❌ Failed to geocode: ${hotels[i].name} in ${city}`);
            }

            // Respect Nominatim rate limit (1 request per second recommended)
            await delay(1000);
        }

        console.log('Seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seedLocations();
