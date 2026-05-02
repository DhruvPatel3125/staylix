require('dotenv').config();
const mongoose = require('mongoose');
const cloudinary = require('./src/config/cloudinary');
const Hotel = require('./src/models/hotel');
const Room = require('./src/models/room');

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://staylix:Dhruv%40123@cluster0.yfioohd.mongodb.net/staylix';
const OWNER_ID = '69b1858f154d66858eb0f037';

const CITIES = [
    { city: "Mumbai", state: "Maharashtra", lat: 19.0760, lng: 72.8777 },
    { city: "New Delhi", state: "Delhi", lat: 28.6139, lng: 77.2090 },
    { city: "Bangalore", state: "Karnataka", lat: 12.9716, lng: 77.5946 },
    { city: "Goa", state: "Goa", lat: 15.2993, lng: 74.1240 },
    { city: "Jaipur", state: "Rajasthan", lat: 26.9124, lng: 75.7873 },
    { city: "Udaipur", state: "Rajasthan", lat: 24.5854, lng: 73.7125 },
    { city: "Manali", state: "Himachal Pradesh", lat: 32.2432, lng: 77.1892 },
    { city: "Shimla", state: "Himachal Pradesh", lat: 31.1048, lng: 77.1734 },
    { city: "Kochi", state: "Kerala", lat: 9.9312, lng: 76.2673 },
    { city: "Hyderabad", state: "Telangana", lat: 17.3850, lng: 78.4867 }
];

const CONFIRMED_IDS = [
    'photo-1566073771259-6a8506099945', 'photo-1582719478250-c89cae4dc85b', 'photo-1564501049412-61c2a3083791',
    'photo-1571896349842-33c89424de2d', 'photo-1520250497591-112f2f40a3f4', 'photo-1551882547-ff43c63efe8c',
    'photo-1563911302283-d2bc129e7570', 'photo-1561501900-3701fa6a0864', 'photo-1596394516093-501ba68a0ba6',
    'photo-1578683010236-d716f9a3f461', 'photo-1512918728675-ed5a9ecdebfd', 'photo-1506953823976-52e1bdc0149a',
    'photo-1507525428034-b723cf961d3e', 'photo-1519046904884-53103b34b206', 'photo-1533759413974-9e15f3b745ac',
    'photo-1584132967334-10e028b1db6d', 'photo-1582719508461-905c673771fd', 'photo-1505691938895-1758d7feb511',
    'photo-1502672260266-1c1ef2d93688', 'photo-1566665797739-1674de7a421a'
];

const CATEGORIES = [
    { type: 'luxury', names: ['Grand', 'Royal', 'Elite', 'Majestic'], suffixes: ['Plaza', 'Palace'], amenities: ['Spa', 'Pool'], keywords: 'luxury' },
    { type: 'resort', names: ['Sunny', 'Ocean', 'Palm', 'Tropical'], suffixes: ['Resort', 'Breeze'], amenities: ['Beach', 'Bar'], keywords: 'resort' },
    { type: 'boutique', names: ['Heritage', 'Artisan', 'Urban', 'Chic'], suffixes: ['Stays', 'Inn'], amenities: ['Art', 'Decor'], keywords: 'boutique' },
    { type: 'business', names: ['Summit', 'Nexus', 'Corporate', 'Metro'], suffixes: ['Suites', 'Inn'], amenities: ['WiFi', 'Desk'], keywords: 'business' }
];

const ROOM_TYPES = [
    { type: 'single', label: 'Classic Single', capacity: 1, basePrice: 2000 },
    { type: 'double', label: 'Comfort Double', capacity: 2, basePrice: 3500 },
    { type: 'deluxe', label: 'Premium Deluxe', capacity: 2, basePrice: 6000 },
    { type: 'suite', label: 'Executive Suite', capacity: 4, basePrice: 12000 }
];

const cloudinaryCache = new Map();

async function uploadToCloudinary(photoId, folder) {
    if (cloudinaryCache.has(photoId)) return cloudinaryCache.get(photoId);
    const url = `https://images.unsplash.com/${photoId}`;
    try {
        const result = await cloudinary.uploader.upload(url, { folder: `staylix/${folder}` });
        cloudinaryCache.set(photoId, result.secure_url);
        return result.secure_url;
    } catch (error) {
        console.error(`Cloudinary upload failed for ${photoId}:`, error.message);
        return `${url}?auto=format&fit=crop&w=1200&q=80`;
    }
}

async function seedDatabase() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');
        await Hotel.deleteMany({});
        await Room.deleteMany({});
        console.log('Database cleared.');

        for (let i = 0; i < 50; i++) {
            const cityData = CITIES[i % CITIES.length];
            const categoryData = CATEGORIES[i % CATEGORIES.length];
            const hotelName = `${categoryData.names[i % categoryData.names.length]} ${categoryData.suffixes[i % categoryData.suffixes.length]} ${i + 1}`;
            const hotelId = new mongoose.Types.ObjectId();

            const photoId = CONFIRMED_IDS[i % CONFIRMED_IDS.length];
            const cloudinaryUrl = await uploadToCloudinary(photoId, 'hotels');
            console.log(`[${i+1}/50] Seeding: ${hotelName}`);

            const hotel = new Hotel({
                _id: hotelId,
                ownerId: OWNER_ID,
                name: hotelName,
                address: { city: cityData.city, state: cityData.state, country: 'India', pincode: (110001 + i).toString() },
                description: `${hotelName} is a top stay in ${cityData.city}.`,
                amenities: categoryData.amenities,
                category: categoryData.type,
                photos: [cloudinaryUrl],
                rating: (4.0 + (i % 10) / 10).toFixed(1),
                isActive: true,
                location: { 
                    type: 'Point', 
                    coordinates: [
                        cityData.lng + (Math.random() - 0.5) * 0.1, 
                        cityData.lat + (Math.random() - 0.5) * 0.1
                    ] 
                }
            });
            await hotel.save();

            for (let j = 0; j < 2; j++) {
                const roomTypeData = ROOM_TYPES[(i + j) % ROOM_TYPES.length];
                const roomPhotoId = CONFIRMED_IDS[(i + j + 5) % CONFIRMED_IDS.length];
                const roomUrl = await uploadToCloudinary(roomPhotoId, 'rooms');
                const room = new Room({
                    hotelId: hotelId,
                    title: `${roomTypeData.label}`,
                    roomType: roomTypeData.type,
                    pricePerNight: roomTypeData.basePrice + (i * 100),
                    totalRooms: 10,
                    guestCapacity: roomTypeData.capacity,
                    image: roomUrl,
                    photos: [roomUrl],
                    isAvailable: true
                });
                await room.save();
            }
        }
        console.log('Successfully seeded 50 hotels and 100 rooms with Cloudinary images!');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

seedDatabase();
