const mongoose = require('mongoose');

// ==========================================
// Replace `ownerId` with a real `User` ObjectId 
// from your DB who has the 'owner' role.
// ==========================================
const ownerId = new mongoose.Types.ObjectId();

const hotels = [];
const rooms = [];

const generateHotelId = () => new mongoose.Types.ObjectId();

// ------------------------------------------------------------------
// 1. Grand Plaza Hotel (Mumbai)
// ------------------------------------------------------------------
const h1Id = generateHotelId();
hotels.push({
    _id: h1Id,
    ownerId: ownerId,
    name: "Grand Plaza Hotel",
    address: { city: "Mumbai", state: "Maharashtra", country: "India", pincode: "400001" },
    description: "Experience luxury in the heart of Mumbai with our 5-star amenities.",
    amenities: ["Free WiFi", "Swimming Pool", "Spa", "Gym", "Restaurant", "Room Service"],
    photos: [
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1542314831-c6a4d14b423c?fit=crop&w=800&q=80"
    ],
    rating: 4.8,
    isActive: true,
    location: { type: "Point", coordinates: [72.8258, 18.9220] } // [lng, lat]
});
rooms.push({
    hotelId: h1Id,
    title: "Deluxe Ocean View",
    roomType: "deluxe",
    pricePerNight: 8500,
    totalRooms: 15,
    guestCapacity: 2,
    amenities: ["King Bed", "Sea View", "Mini Bar", "Bathtub", "AC"],
    image: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?fit=crop&w=800&q=80",
    photos: ["https://images.unsplash.com/photo-1578683010236-d716f9a3f461"],
    isAvailable: true
});
rooms.push({
    hotelId: h1Id,
    title: "Presidential Suite",
    roomType: "suite",
    pricePerNight: 25000,
    totalRooms: 2,
    guestCapacity: 4,
    amenities: ["Living Area", "Private Pool", "Butler Service", "Sea View", "AC"],
    image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?fit=crop&w=800&q=80",
    photos: ["https://images.unsplash.com/photo-1590490360182-c33d57733427"],
    isAvailable: true
});

// ------------------------------------------------------------------
// 2. Himalayan Myst Retreat (Manali)
// ------------------------------------------------------------------
const h2Id = generateHotelId();
hotels.push({
    _id: h2Id,
    ownerId: ownerId,
    name: "Himalayan Myst Retreat",
    address: { city: "Manali", state: "Himachal Pradesh", country: "India", pincode: "175131" },
    description: "A serene getaway surrounded by snow-capped peaks and pine forests.",
    amenities: ["Free WiFi", "Heater", "Bonfire", "Restaurant", "Mountain View"],
    photos: ["https://images.unsplash.com/photo-1519999482648-25049ddd37b1?fit=crop&w=800&q=80"],
    rating: 4.5,
    isActive: true,
    location: { type: "Point", coordinates: [77.1887, 32.2396] }
});
rooms.push({
    hotelId: h2Id,
    title: "Pine Wood Double",
    roomType: "double",
    pricePerNight: 4500,
    totalRooms: 20,
    guestCapacity: 2,
    amenities: ["Queen Bed", "Balcony", "Heater", "Mountain View"],
    image: "https://images.unsplash.com/photo-1598928506311-c55dd1b46f56?fit=crop&w=800&q=80",
    photos: ["https://images.unsplash.com/photo-1598928506311-c55dd1b46f56"],
    isAvailable: true
});
rooms.push({
    hotelId: h2Id,
    title: "Luxury Family Suite",
    roomType: "suite",
    pricePerNight: 9500,
    totalRooms: 5,
    guestCapacity: 4,
    amenities: ["Two Bedrooms", "Living Room", "Fireplace", "Mountain View"],
    image: "https://images.unsplash.com/photo-1629140727571-9b5c6f6267b4?fit=crop&w=800&q=80",
    photos: ["https://images.unsplash.com/photo-1629140727571-9b5c6f6267b4"],
    isAvailable: true
});

// ------------------------------------------------------------------
// 3. Royal Heritage Palace (Jaipur)
// ------------------------------------------------------------------
const h3Id = generateHotelId();
hotels.push({
    _id: h3Id,
    ownerId: ownerId,
    name: "Royal Heritage Palace",
    address: { city: "Jaipur", state: "Rajasthan", country: "India", pincode: "302001" },
    description: "Live like royalty in this authentic Rajputana style heritage hotel.",
    amenities: ["Free WiFi", "Swimming Pool", "Spa", "Cultural Events", "Restaurant"],
    photos: ["https://images.unsplash.com/photo-1582719508461-905c673771fd?fit=crop&w=800&q=80"],
    rating: 4.7,
    isActive: true,
    location: { type: "Point", coordinates: [75.7873, 26.9124] }
});
rooms.push({
    hotelId: h3Id,
    title: "Rajputana Deluxe",
    roomType: "deluxe",
    pricePerNight: 6500,
    totalRooms: 12,
    guestCapacity: 2,
    amenities: ["King Bed", "Heritage Decor", "AC", "Mini Fridge"],
    image: "https://images.unsplash.com/photo-1563911302283-d2bc129e7570?fit=crop&w=800&q=80",
    photos: ["https://images.unsplash.com/photo-1563911302283-d2bc129e7570"],
    isAvailable: true
});
rooms.push({
    hotelId: h3Id,
    title: "Maharaja Suite",
    roomType: "suite",
    pricePerNight: 18000,
    totalRooms: 3,
    guestCapacity: 3,
    amenities: ["Four-poster Bed", "Private Terrace", "Jacuzzi", "Living Area"],
    image: "https://images.unsplash.com/photo-1584132967334-10e028b1db6d?fit=crop&w=800&q=80",
    photos: ["https://images.unsplash.com/photo-1584132967334-10e028b1db6d"],
    isAvailable: true
});

// ------------------------------------------------------------------
// 4. Ocean Breeze Resort (Goa)
// ------------------------------------------------------------------
const h4Id = generateHotelId();
hotels.push({
    _id: h4Id,
    ownerId: ownerId,
    name: "Ocean Breeze Resort",
    address: { city: "Goa", state: "Goa", country: "India", pincode: "403001" },
    description: "Right on the beach, experience the true coastal vibe of Goa.",
    amenities: ["Free WiFi", "Beach Access", "Pool bar", "Spa", "Water Sports"],
    photos: ["https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?fit=crop&w=800&q=80"],
    rating: 4.6,
    isActive: true,
    location: { type: "Point", coordinates: [73.8567, 15.2993] }
});
rooms.push({
    hotelId: h4Id,
    title: "Standard Single",
    roomType: "single",
    pricePerNight: 3500,
    totalRooms: 10,
    guestCapacity: 1,
    amenities: ["Single Bed", "AC", "TV", "Garden View"],
    image: "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?fit=crop&w=800&q=80",
    photos: ["https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd"],
    isAvailable: true
});
rooms.push({
    hotelId: h4Id,
    title: "Oceanfront Double",
    roomType: "double",
    pricePerNight: 5500,
    totalRooms: 20,
    guestCapacity: 2,
    amenities: ["Queen Bed", "AC", "Balcony", "Sea View"],
    image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?fit=crop&w=800&q=80",
    photos: ["https://images.unsplash.com/photo-1505691938895-1758d7feb511"],
    isAvailable: true
});

// ------------------------------------------------------------------
// 5. City Center Business Inn (Delhi)
// ------------------------------------------------------------------
const h5Id = generateHotelId();
hotels.push({
    _id: h5Id,
    ownerId: ownerId,
    name: "City Center Business Inn",
    address: { city: "New Delhi", state: "Delhi", country: "India", pincode: "110001" },
    description: "Modern stay in the capital tailored for busy business travelers.",
    amenities: ["Free WiFi", "Business Center", "Gym", "Conference Room", "Restaurant"],
    photos: ["https://images.unsplash.com/photo-1549294413-26f195200c16?fit=crop&w=800&q=80"],
    rating: 4.2,
    isActive: true,
    location: { type: "Point", coordinates: [77.2090, 28.6139] }
});
rooms.push({
    hotelId: h5Id,
    title: "Executive Single",
    roomType: "single",
    pricePerNight: 4000,
    totalRooms: 30,
    guestCapacity: 1,
    amenities: ["Work Desk", "AC", "High-speed WiFi", "Coffee Maker"],
    image: "https://images.unsplash.com/photo-1618773928120-294158402ee3?fit=crop&w=800&q=80",
    photos: ["https://images.unsplash.com/photo-1618773928120-294158402ee3"],
    isAvailable: true
});
rooms.push({
    hotelId: h5Id,
    title: "Premium Double",
    roomType: "double",
    pricePerNight: 6000,
    totalRooms: 15,
    guestCapacity: 2,
    amenities: ["Queen Bed", "City View", "AC", "Bathtub"],
    image: "https://images.unsplash.com/photo-1574643156929-51fa098b0394?fit=crop&w=800&q=80",
    photos: ["https://images.unsplash.com/photo-1574643156929-51fa098b0394"],
    isAvailable: true
});

// ------------------------------------------------------------------
// 6. Lakefront Palace (Udaipur)
// ------------------------------------------------------------------
const h6Id = generateHotelId();
hotels.push({
    _id: h6Id,
    ownerId: ownerId,
    name: "Lakefront Palace",
    address: { city: "Udaipur", state: "Rajasthan", country: "India", pincode: "313001" },
    description: "Tranquil property offering mesmerizing views of the Pichola lake.",
    amenities: ["Free WiFi", "Lake View", "Restaurant", "Boat Rides", "Spa"],
    photos: ["https://images.unsplash.com/photo-1601221775195-2cc0b92e7aa2?fit=crop&w=800&q=80"],
    rating: 4.9,
    isActive: true,
    location: { type: "Point", coordinates: [73.6828, 24.5854] }
});
rooms.push({
    hotelId: h6Id,
    title: "Lakeview Deluxe",
    roomType: "deluxe",
    pricePerNight: 12000,
    totalRooms: 8,
    guestCapacity: 2,
    amenities: ["King Bed", "Lake View", "AC", "Minibar"],
    image: "https://images.unsplash.com/photo-1621293954908-907159247fc8?fit=crop&w=800&q=80",
    photos: ["https://images.unsplash.com/photo-1621293954908-907159247fc8"],
    isAvailable: true
});
rooms.push({
    hotelId: h6Id,
    title: "Royal Suite",
    roomType: "suite",
    pricePerNight: 35000,
    totalRooms: 2,
    guestCapacity: 3,
    amenities: ["Private Balcony", "Lake View", "Luxury Decor", "Jacuzzi"],
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?fit=crop&w=800&q=80",
    photos: ["https://images.unsplash.com/photo-1582719478250-c89cae4dc85b"],
    isAvailable: true
});

// ------------------------------------------------------------------
// 7. Sunset Boulevard (Kochi)
// ------------------------------------------------------------------
const h7Id = generateHotelId();
hotels.push({
    _id: h7Id,
    ownerId: ownerId,
    name: "Sunset Boulevard",
    address: { city: "Kochi", state: "Kerala", country: "India", pincode: "682001" },
    description: "A gateway to the backwaters with amazing coastal delicacies.",
    amenities: ["Free WiFi", "Backwater Cruise", "Ayurvedic Spa", "Seafood Restaurant"],
    photos: ["https://images.unsplash.com/photo-1620986798031-64d1f2e22c00?fit=crop&w=800&q=80"],
    rating: 4.4,
    isActive: true,
    location: { type: "Point", coordinates: [76.2711, 9.9312] }
});
rooms.push({
    hotelId: h7Id,
    title: "Backwater Double",
    roomType: "double",
    pricePerNight: 5000,
    totalRooms: 15,
    guestCapacity: 2,
    amenities: ["Queen Bed", "Water View", "AC", "TV"],
    image: "https://images.unsplash.com/photo-1560185013-149eb0f329ee?fit=crop&w=800&q=80",
    photos: ["https://images.unsplash.com/photo-1560185013-149eb0f329ee"],
    isAvailable: true
});

// ------------------------------------------------------------------
// 8. Desert Oasis (Jaisalmer)
// ------------------------------------------------------------------
const h8Id = generateHotelId();
hotels.push({
    _id: h8Id,
    ownerId: ownerId,
    name: "Desert Oasis Resort",
    address: { city: "Jaisalmer", state: "Rajasthan", country: "India", pincode: "345001" },
    description: "Luxury tents and rooms amidst the golden sand dunes of Thar.",
    amenities: ["Free WiFi", "Desert Safari", "Folk Dance", "Outdoor Pool"],
    photos: ["https://images.unsplash.com/photo-1528659223383-7d800ad43fdd?fit=crop&w=800&q=80"],
    rating: 4.6,
    isActive: true,
    location: { type: "Point", coordinates: [70.9083, 26.9157] }
});

rooms.push({
    hotelId: h8Id,
    title: "Dune View Deluxe",
    roomType: "deluxe",
    pricePerNight: 7000,
    totalRooms: 12,
    guestCapacity: 2,
    amenities: ["King Bed", "Sand Dune View", "AC", "Traditional Decor"],
    image: "https://images.unsplash.com/photo-1580211756588-ac41df887d19?fit=crop&w=800&q=80",
    photos: ["https://images.unsplash.com/photo-1580211756588-ac41df887d19"],
    isAvailable: true
});

// ------------------------------------------------------------------
// 9. Forest Retreat (Wayanad)
// ------------------------------------------------------------------
const h9Id = generateHotelId();
hotels.push({
    _id: h9Id,
    ownerId: ownerId,
    name: "Forest Retreat",
    address: { city: "Wayanad", state: "Kerala", country: "India", pincode: "673592" },
    description: "Immerse yourself in nature in this eco-friendly forest resort.",
    amenities: ["Eco Trails", "Treehouses", "Organic Food", "Bird Watching", "Yoga"],
    photos: ["https://images.unsplash.com/photo-1562916174-a82987dedb97?fit=crop&w=800&q=80"],
    rating: 4.8,
    isActive: true,
    location: { type: "Point", coordinates: [76.0827, 11.6854] }
});
rooms.push({
    hotelId: h9Id,
    title: "Treehouse Single",
    roomType: "single",
    pricePerNight: 5500,
    totalRooms: 5,
    guestCapacity: 1,
    amenities: ["Single Bed", "Forest View", "Balcony", "Tea Maker"],
    image: "https://images.unsplash.com/photo-1449844908441-8829872d2607?fit=crop&w=800&q=80",
    photos: ["https://images.unsplash.com/photo-1449844908441-8829872d2607"],
    isAvailable: true
});
rooms.push({
    hotelId: h9Id,
    title: "Nature Deluxe",
    roomType: "deluxe",
    pricePerNight: 8500,
    totalRooms: 10,
    guestCapacity: 2,
    amenities: ["Queen Bed", "Forest View", "AC", "Private Patio"],
    image: "https://images.unsplash.com/photo-1616428662998-0c6caadbea9a?fit=crop&w=800&q=80",
    photos: ["https://images.unsplash.com/photo-1616428662998-0c6caadbea9a"],
    isAvailable: true
});

// ------------------------------------------------------------------
// 10. Skyline Tower (Bangalore)
// ------------------------------------------------------------------
const h10Id = generateHotelId();
hotels.push({
    _id: h10Id,
    ownerId: ownerId,
    name: "Skyline Tower Hotel",
    address: { city: "Bangalore", state: "Karnataka", country: "India", pincode: "560001" },
    description: "Sleek and luxurious skyscrapers offering the best city views.",
    amenities: ["Free WiFi", "Infinity Pool", "Helipad", "Gym", "Lounge", "Spa"],
    photos: ["https://images.unsplash.com/photo-1564501049412-61c2a3083791?fit=crop&w=800&q=80"],
    rating: 4.7,
    isActive: true,
    location: { type: "Point", coordinates: [77.5946, 12.9716] }
});
rooms.push({
    hotelId: h10Id,
    title: "Sky Double",
    roomType: "double",
    pricePerNight: 7500,
    totalRooms: 25,
    guestCapacity: 2,
    amenities: ["Queen Bed", "City View", "AC", "High-speed WiFi"],
    image: "https://images.unsplash.com/photo-1501876725168-00c445821c9e?fit=crop&w=800&q=80",
    photos: ["https://images.unsplash.com/photo-1501876725168-00c445821c9e"],
    isAvailable: true
});
rooms.push({
    hotelId: h10Id,
    title: "Penthouse Suite",
    roomType: "suite",
    pricePerNight: 30000,
    totalRooms: 3,
    guestCapacity: 4,
    amenities: ["Panoramic City View", "Kitchenette", "Living Room", "Butler"],
    image: "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?fit=crop&w=800&q=80",
    photos: ["https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd"],
    isAvailable: true
});

module.exports = { hotels, rooms };
