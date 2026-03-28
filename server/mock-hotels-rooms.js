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

// ------------------------------------------------------------------
// 11. Royal Pearl Inn (Hyderabad)
// ------------------------------------------------------------------
const h11Id = generateHotelId();
hotels.push({
    _id: h11Id,
    ownerId: ownerId,
    name: "Royal Pearl Inn",
    address: { city: "Hyderabad", state: "Telangana", country: "India", pincode: "500001" },
    description: "Experience Nizami hospitality mixed with high-tech modern amenities.",
    amenities: ["Free WiFi", "Swimming Pool", "Gym", "Restaurant", "Conference Room"],
    photos: ["https://images.unsplash.com/photo-1542314831-c6a4d14b423c?fit=crop&w=800&q=80"],
    rating: 4.6,
    isActive: true,
    location: { type: "Point", coordinates: [78.4867, 17.3850] }
});
rooms.push({
    hotelId: h11Id,
    title: "Pearl Deluxe",
    roomType: "deluxe",
    pricePerNight: 5500,
    totalRooms: 15,
    guestCapacity: 2,
    amenities: ["King Bed", "City View", "AC", "Minibar"],
    image: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?fit=crop&w=800&q=80",
    photos: ["https://images.unsplash.com/photo-1578683010236-d716f9a3f461"],
    isAvailable: true
});

// ------------------------------------------------------------------
// 12. Marina Bay Retreat (Chennai)
// ------------------------------------------------------------------
const h12Id = generateHotelId();
hotels.push({
    _id: h12Id,
    ownerId: ownerId,
    name: "Marina Bay Retreat",
    address: { city: "Chennai", state: "Tamil Nadu", country: "India", pincode: "600001" },
    description: "A gorgeous retreat near Marina beach with refreshing ocean breezes.",
    amenities: ["Free WiFi", "Beach Access", "Spa", "Seafood Restaurant"],
    photos: ["https://images.unsplash.com/photo-1566073771259-6a8506099945?fit=crop&w=800&q=80"],
    rating: 4.5,
    isActive: true,
    location: { type: "Point", coordinates: [80.2707, 13.0827] }
});
rooms.push({
    hotelId: h12Id,
    title: "Ocean View Double",
    roomType: "double",
    pricePerNight: 4800,
    totalRooms: 20,
    guestCapacity: 2,
    amenities: ["Queen Bed", "Sea View", "AC", "Balcony"],
    image: "https://images.unsplash.com/photo-1598928506311-c55dd1b46f56?fit=crop&w=800&q=80",
    photos: ["https://images.unsplash.com/photo-1598928506311-c55dd1b46f56"],
    isAvailable: true
});

// ------------------------------------------------------------------
// 13. Heritage Inn (Pune)
// ------------------------------------------------------------------
const h13Id = generateHotelId();
hotels.push({
    _id: h13Id,
    ownerId: ownerId,
    name: "Heritage Inn",
    address: { city: "Pune", state: "Maharashtra", country: "India", pincode: "411001" },
    description: "A cultural hub featuring Maratha architecture in the heart of Pune.",
    amenities: ["Free WiFi", "Garden", "Library", "Local Cuisine"],
    photos: ["https://images.unsplash.com/photo-1519999482648-25049ddd37b1?fit=crop&w=800&q=80"],
    rating: 4.3,
    isActive: true,
    location: { type: "Point", coordinates: [73.8567, 18.5204] }
});
rooms.push({
    hotelId: h13Id,
    title: "Heritage Single",
    roomType: "single",
    pricePerNight: 2500,
    totalRooms: 10,
    guestCapacity: 1,
    amenities: ["Single Bed", "Garden View", "AC"],
    image: "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?fit=crop&w=800&q=80",
    photos: ["https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd"],
    isAvailable: true
});

// ------------------------------------------------------------------
// 14. The Sapphire Plaza (Ahmedabad)
// ------------------------------------------------------------------
const h14Id = generateHotelId();
hotels.push({
    _id: h14Id,
    ownerId: ownerId,
    name: "The Sapphire Plaza",
    address: { city: "Ahmedabad", state: "Gujarat", country: "India", pincode: "380001" },
    description: "Modern elegance providing optimum comfort for business and leisure.",
    amenities: ["Free WiFi", "Gym", "Business Center", "Multi-cuisine Restaurant"],
    photos: ["https://images.unsplash.com/photo-1582719508461-905c673771fd?fit=crop&w=800&q=80"],
    rating: 4.4,
    isActive: true,
    location: { type: "Point", coordinates: [72.5714, 23.0225] }
});
rooms.push({
    hotelId: h14Id,
    title: "Plaza Suite",
    roomType: "suite",
    pricePerNight: 9000,
    totalRooms: 5,
    guestCapacity: 3,
    amenities: ["King Bed", "Living Room", "AC", "Bathtub"],
    image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?fit=crop&w=800&q=80",
    photos: ["https://images.unsplash.com/photo-1590490360182-c33d57733427"],
    isAvailable: true
});

// ------------------------------------------------------------------
// 15. Ganges View Hotel (Kolkata)
// ------------------------------------------------------------------
const h15Id = generateHotelId();
hotels.push({
    _id: h15Id,
    ownerId: ownerId,
    name: "Ganges View Hotel",
    address: { city: "Kolkata", state: "West Bengal", country: "India", pincode: "700001" },
    description: "Classic colonial charm offering spectacular views of the Hooghly river.",
    amenities: ["Free WiFi", "River View", "Fine Dining", "Barting Service"],
    photos: ["https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?fit=crop&w=800&q=80"],
    rating: 4.7,
    isActive: true,
    location: { type: "Point", coordinates: [88.3639, 22.5726] }
});
rooms.push({
    hotelId: h15Id,
    title: "Colonial Double",
    roomType: "double",
    pricePerNight: 6000,
    totalRooms: 12,
    guestCapacity: 2,
    amenities: ["Queen Bed", "River View", "AC", "Antique Furniture"],
    image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?fit=crop&w=800&q=80",
    photos: ["https://images.unsplash.com/photo-1505691938895-1758d7feb511"],
    isAvailable: true
});

// ------------------------------------------------------------------
// 16. Diamond Stay (Surat)
// ------------------------------------------------------------------
const h16Id = generateHotelId();
hotels.push({
    _id: h16Id,
    ownerId: ownerId,
    name: "Diamond Stay",
    address: { city: "Surat", state: "Gujarat", country: "India", pincode: "395003" },
    description: "A sparkling new stay in the diamond city with easy access to markets.",
    amenities: ["Free WiFi", "Gym", "Lounge", "Restaurant"],
    photos: ["https://images.unsplash.com/photo-1549294413-26f195200c16?fit=crop&w=800&q=80"],
    rating: 4.2,
    isActive: true,
    location: { type: "Point", coordinates: [72.8311, 21.1702] }
});
rooms.push({
    hotelId: h16Id,
    title: "Standard Double",
    roomType: "double",
    pricePerNight: 3500,
    totalRooms: 18,
    guestCapacity: 2,
    amenities: ["Queen Bed", "City View", "AC", "TV"],
    image: "https://images.unsplash.com/photo-1563911302283-d2bc129e7570?fit=crop&w=800&q=80",
    photos: ["https://images.unsplash.com/photo-1563911302283-d2bc129e7570"],
    isAvailable: true
});

// ------------------------------------------------------------------
// 17. Pink City Hub (Jaipur)
// ------------------------------------------------------------------
const h17Id = generateHotelId();
hotels.push({
    _id: h17Id,
    ownerId: ownerId,
    name: "Pink City Hub",
    address: { city: "Jaipur", state: "Rajasthan", country: "India", pincode: "302002" },
    description: "Affordable boutique stays right in the middle of Jaipur's bustling bazaars.",
    amenities: ["Free WiFi", "Rooftop Cafe", "Tour Desk", "AC"],
    photos: ["https://images.unsplash.com/photo-1601221775195-2cc0b92e7aa2?fit=crop&w=800&q=80"],
    rating: 4.1,
    isActive: true,
    location: { type: "Point", coordinates: [75.8200, 26.9150] }
});
rooms.push({
    hotelId: h17Id,
    title: "Bazaar View Room",
    roomType: "single",
    pricePerNight: 2000,
    totalRooms: 15,
    guestCapacity: 1,
    amenities: ["Single Bed", "Street View", "AC", "Free WiFi"],
    image: "https://images.unsplash.com/photo-1618773928120-294158402ee3?fit=crop&w=800&q=80",
    photos: ["https://images.unsplash.com/photo-1618773928120-294158402ee3"],
    isAvailable: true
});

// ------------------------------------------------------------------
// 18. Majestic Gateway (Lucknow)
// ------------------------------------------------------------------
const h18Id = generateHotelId();
hotels.push({
    _id: h18Id,
    ownerId: ownerId,
    name: "Majestic Gateway",
    address: { city: "Lucknow", state: "Uttar Pradesh", country: "India", pincode: "226001" },
    description: "Royal Awadhi hospitality, famous for its mouth-watering culinary delights.",
    amenities: ["Free WiFi", "Awadhi Restaurant", "Banquet Hall", "Valet Parking"],
    photos: ["https://images.unsplash.com/photo-1620986798031-64d1f2e22c00?fit=crop&w=800&q=80"],
    rating: 4.5,
    isActive: true,
    location: { type: "Point", coordinates: [80.9462, 26.8467] }
});
rooms.push({
    hotelId: h18Id,
    title: "Nawab Suite",
    roomType: "suite",
    pricePerNight: 8500,
    totalRooms: 4,
    guestCapacity: 3,
    amenities: ["King Bed", "Traditional Decor", "AC", "Luxury Bath"],
    image: "https://images.unsplash.com/photo-1584132967334-10e028b1db6d?fit=crop&w=800&q=80",
    photos: ["https://images.unsplash.com/photo-1584132967334-10e028b1db6d"],
    isAvailable: true
});

// ------------------------------------------------------------------
// 19. Riverside Rest (Kanpur)
// ------------------------------------------------------------------
const h19Id = generateHotelId();
hotels.push({
    _id: h19Id,
    ownerId: ownerId,
    name: "Riverside Rest",
    address: { city: "Kanpur", state: "Uttar Pradesh", country: "India", pincode: "208001" },
    description: "Peaceful environment by the banks of the Ganges for a perfect relaxation.",
    amenities: ["Free WiFi", "River View", "Garden", "Breakfast Buffet"],
    photos: ["https://images.unsplash.com/photo-1528659223383-7d800ad43fdd?fit=crop&w=800&q=80"],
    rating: 4.0,
    isActive: true,
    location: { type: "Point", coordinates: [80.3319, 26.4499] }
});
rooms.push({
    hotelId: h19Id,
    title: "Riverside Double",
    roomType: "double",
    pricePerNight: 3200,
    totalRooms: 20,
    guestCapacity: 2,
    amenities: ["Queen Bed", "River View", "AC", "TV"],
    image: "https://images.unsplash.com/photo-1574643156929-51fa098b0394?fit=crop&w=800&q=80",
    photos: ["https://images.unsplash.com/photo-1574643156929-51fa098b0394"],
    isAvailable: true
});

// ------------------------------------------------------------------
// 20. Orange City Plaza (Nagpur)
// ------------------------------------------------------------------
const h20Id = generateHotelId();
hotels.push({
    _id: h20Id,
    ownerId: ownerId,
    name: "Orange City Plaza",
    address: { city: "Nagpur", state: "Maharashtra", country: "India", pincode: "440001" },
    description: "Comfortable and accessible hotel located in the heart of India.",
    amenities: ["Free WiFi", "Dining", "Business Center", "Airport Shuttle"],
    photos: ["https://images.unsplash.com/photo-1562916174-a82987dedb97?fit=crop&w=800&q=80"],
    rating: 4.3,
    isActive: true,
    location: { type: "Point", coordinates: [79.0882, 21.1458] }
});
rooms.push({
    hotelId: h20Id,
    title: "Executive Double",
    roomType: "double",
    pricePerNight: 4000,
    totalRooms: 25,
    guestCapacity: 2,
    amenities: ["Queen Bed", "AC", "Workspace", "Free WiFi"],
    image: "https://images.unsplash.com/photo-1621293954908-907159247fc8?fit=crop&w=800&q=80",
    photos: ["https://images.unsplash.com/photo-1621293954908-907159247fc8"],
    isAvailable: true
});

// ------------------------------------------------------------------
// 21. Central Park Hotel (Indore)
// ------------------------------------------------------------------
const h21Id = generateHotelId();
hotels.push({
    _id: h21Id,
    ownerId: ownerId,
    name: "Central Park Hotel",
    address: { city: "Indore", state: "Madhya Pradesh", country: "India", pincode: "452001" },
    description: "Experience the cleanest city in India with top-tier accommodations.",
    amenities: ["Free WiFi", "Gym", "Spa", "Multi-cuisine Restaurant"],
    photos: ["https://images.unsplash.com/photo-1564501049412-61c2a3083791?fit=crop&w=800&q=80"],
    rating: 4.6,
    isActive: true,
    location: { type: "Point", coordinates: [75.8577, 22.7196] }
});
rooms.push({
    hotelId: h21Id,
    title: "Park View Deluxe",
    roomType: "deluxe",
    pricePerNight: 5200,
    totalRooms: 12,
    guestCapacity: 2,
    amenities: ["King Bed", "Park View", "AC", "Minibar"],
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?fit=crop&w=800&q=80",
    photos: ["https://images.unsplash.com/photo-1582719478250-c89cae4dc85b"],
    isAvailable: true
});

// ------------------------------------------------------------------
// 22. Lakeview Paradise (Bhopal)
// ------------------------------------------------------------------
const h22Id = generateHotelId();
hotels.push({
    _id: h22Id,
    ownerId: ownerId,
    name: "Lakeview Paradise",
    address: { city: "Bhopal", state: "Madhya Pradesh", country: "India", pincode: "462001" },
    description: "Scenic views of the upper lake with exquisite sunset dining.",
    amenities: ["Free WiFi", "Lake View", "Restaurant", "Pool"],
    photos: ["https://images.unsplash.com/photo-1566073771259-6a8506099945?fit=crop&w=800&q=80"],
    rating: 4.5,
    isActive: true,
    location: { type: "Point", coordinates: [77.4126, 23.2599] }
});
rooms.push({
    hotelId: h22Id,
    title: "Paradise Suite",
    roomType: "suite",
    pricePerNight: 8000,
    totalRooms: 6,
    guestCapacity: 3,
    amenities: ["King Bed", "Lake View", "Balcony", "AC"],
    image: "https://images.unsplash.com/photo-1560185013-149eb0f329ee?fit=crop&w=800&q=80",
    photos: ["https://images.unsplash.com/photo-1560185013-149eb0f329ee"],
    isAvailable: true
});

// ------------------------------------------------------------------
// 23. Coastal Marina (Visakhapatnam)
// ------------------------------------------------------------------
const h23Id = generateHotelId();
hotels.push({
    _id: h23Id,
    ownerId: ownerId,
    name: "Coastal Marina",
    address: { city: "Visakhapatnam", state: "Andhra Pradesh", country: "India", pincode: "530001" },
    description: "Luxury by the Bay of Bengal, offering serene beach views.",
    amenities: ["Free WiFi", "Beach Access", "Seafood Restaurant", "Spa"],
    photos: ["https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?fit=crop&w=800&q=80"],
    rating: 4.7,
    isActive: true,
    location: { type: "Point", coordinates: [83.2185, 17.6868] }
});
rooms.push({
    hotelId: h23Id,
    title: "Marina Double",
    roomType: "double",
    pricePerNight: 6500,
    totalRooms: 15,
    guestCapacity: 2,
    amenities: ["Queen Bed", "Sea View", "AC", "TV"],
    image: "https://images.unsplash.com/photo-1580211756588-ac41df887d19?fit=crop&w=800&q=80",
    photos: ["https://images.unsplash.com/photo-1580211756588-ac41df887d19"],
    isAvailable: true
});

// ------------------------------------------------------------------
// 24. Golden Suites (Patna)
// ------------------------------------------------------------------
const h24Id = generateHotelId();
hotels.push({
    _id: h24Id,
    ownerId: ownerId,
    name: "Golden Suites",
    address: { city: "Patna", state: "Bihar", country: "India", pincode: "800001" },
    description: "Premium stays right near the historical sites of ancient Pataliputra.",
    amenities: ["Free WiFi", "Banquet", "Restaurant", "City Tours"],
    photos: ["https://images.unsplash.com/photo-1542314831-c6a4d14b423c?fit=crop&w=800&q=80"],
    rating: 4.1,
    isActive: true,
    location: { type: "Point", coordinates: [85.1376, 25.5941] }
});
rooms.push({
    hotelId: h24Id,
    title: "Golden Single",
    roomType: "single",
    pricePerNight: 2800,
    totalRooms: 10,
    guestCapacity: 1,
    amenities: ["Single Bed", "AC", "City View"],
    image: "https://images.unsplash.com/photo-1449844908441-8829872d2607?fit=crop&w=800&q=80",
    photos: ["https://images.unsplash.com/photo-1449844908441-8829872d2607"],
    isAvailable: true
});

// ------------------------------------------------------------------
// 25. Royal Orchid (Vadodara)
// ------------------------------------------------------------------
const h25Id = generateHotelId();
hotels.push({
    _id: h25Id,
    ownerId: ownerId,
    name: "Royal Orchid",
    address: { city: "Vadodara", state: "Gujarat", country: "India", pincode: "390001" },
    description: "Elegant and sophisticated stays for royal experiences in Vadodara.",
    amenities: ["Free WiFi", "Pool", "Gym", "Lounge"],
    photos: ["https://images.unsplash.com/photo-1519999482648-25049ddd37b1?fit=crop&w=800&q=80"],
    rating: 4.6,
    isActive: true,
    location: { type: "Point", coordinates: [73.1812, 22.3072] }
});
rooms.push({
    hotelId: h25Id,
    title: "Orchid Deluxe",
    roomType: "deluxe",
    pricePerNight: 5500,
    totalRooms: 14,
    guestCapacity: 2,
    amenities: ["King Bed", "Garden View", "AC", "Bathtub"],
    image: "https://images.unsplash.com/photo-1616428662998-0c6caadbea9a?fit=crop&w=800&q=80",
    photos: ["https://images.unsplash.com/photo-1616428662998-0c6caadbea9a"],
    isAvailable: true
});

// ------------------------------------------------------------------
// 26. Taj View Retreat (Agra)
// ------------------------------------------------------------------
const h26Id = generateHotelId();
hotels.push({
    _id: h26Id,
    ownerId: ownerId,
    name: "Taj View Retreat",
    address: { city: "Agra", state: "Uttar Pradesh", country: "India", pincode: "282001" },
    description: "Wake up to breathtaking views of the majestic Taj Mahal.",
    amenities: ["Free WiFi", "Taj View", "Restaurant", "Spa"],
    photos: ["https://images.unsplash.com/photo-1582719508461-905c673771fd?fit=crop&w=800&q=80"],
    rating: 4.9,
    isActive: true,
    location: { type: "Point", coordinates: [78.0081, 27.1767] }
});
rooms.push({
    hotelId: h26Id,
    title: "Taj View Suite",
    roomType: "suite",
    pricePerNight: 12500,
    totalRooms: 5,
    guestCapacity: 2,
    amenities: ["King Bed", "Taj Mahal View", "Balcony", "AC"],
    image: "https://images.unsplash.com/photo-1501876725168-00c445821c9e?fit=crop&w=800&q=80",
    photos: ["https://images.unsplash.com/photo-1501876725168-00c445821c9e"],
    isAvailable: true
});

// ------------------------------------------------------------------
// 27. Vineyard Resort (Nashik)
// ------------------------------------------------------------------
const h27Id = generateHotelId();
hotels.push({
    _id: h27Id,
    ownerId: ownerId,
    name: "Vineyard Resort",
    address: { city: "Nashik", state: "Maharashtra", country: "India", pincode: "422001" },
    description: "Stay among the grapes and enjoy India's finest wine tasting experiences.",
    amenities: ["Wine Tasting", "Vineyard Tours", "Spa", "Free WiFi"],
    photos: ["https://images.unsplash.com/photo-1549294413-26f195200c16?fit=crop&w=800&q=80"],
    rating: 4.8,
    isActive: true,
    location: { type: "Point", coordinates: [73.7898, 19.9975] }
});
rooms.push({
    hotelId: h27Id,
    title: "Vineyard Double",
    roomType: "double",
    pricePerNight: 8500,
    totalRooms: 10,
    guestCapacity: 2,
    amenities: ["Queen Bed", "Vineyard View", "AC", "Wine Welcome Kit"],
    image: "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?fit=crop&w=800&q=80",
    photos: ["https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd"],
    isAvailable: true
});

// ------------------------------------------------------------------
// 28. Industrial Hub Inn (Faridabad)
// ------------------------------------------------------------------
const h28Id = generateHotelId();
hotels.push({
    _id: h28Id,
    ownerId: ownerId,
    name: "Industrial Hub Inn",
    address: { city: "Faridabad", state: "Haryana", country: "India", pincode: "121001" },
    description: "Reliable and convenient accommodation for industrial and business trips.",
    amenities: ["Free WiFi", "Breakfast Included", "Conference Room", "Gym"],
    photos: ["https://images.unsplash.com/photo-1601221775195-2cc0b92e7aa2?fit=crop&w=800&q=80"],
    rating: 4.0,
    isActive: true,
    location: { type: "Point", coordinates: [77.3178, 28.4089] }
});
rooms.push({
    hotelId: h28Id,
    title: "Business Single",
    roomType: "single",
    pricePerNight: 2200,
    totalRooms: 30,
    guestCapacity: 1,
    amenities: ["Single Bed", "Workspace", "AC", "Free WiFi"],
    image: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?fit=crop&w=800&q=80",
    photos: ["https://images.unsplash.com/photo-1578683010236-d716f9a3f461"],
    isAvailable: true
});

// ------------------------------------------------------------------
// 29. Temple Town Stay (Madurai)
// ------------------------------------------------------------------
const h29Id = generateHotelId();
hotels.push({
    _id: h29Id,
    ownerId: ownerId,
    name: "Temple Town Stay",
    address: { city: "Madurai", state: "Tamil Nadu", country: "India", pincode: "625001" },
    description: "Peaceful environment close to the world-renowned Meenakshi Amman Temple.",
    amenities: ["Free WiFi", "Vegetarian Dining", "Tour Assistance", "AC"],
    photos: ["https://images.unsplash.com/photo-1620986798031-64d1f2e22c00?fit=crop&w=800&q=80"],
    rating: 4.4,
    isActive: true,
    location: { type: "Point", coordinates: [78.1198, 9.9252] }
});
rooms.push({
    hotelId: h29Id,
    title: "Pilgrim Double",
    roomType: "double",
    pricePerNight: 3500,
    totalRooms: 15,
    guestCapacity: 2,
    amenities: ["Queen Bed", "AC", "TV", "City View"],
    image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?fit=crop&w=800&q=80",
    photos: ["https://images.unsplash.com/photo-1590490360182-c33d57733427"],
    isAvailable: true
});

// ------------------------------------------------------------------
// 30. Palace Gardens (Mysore)
// ------------------------------------------------------------------
const h30Id = generateHotelId();
hotels.push({
    _id: h30Id,
    ownerId: ownerId,
    name: "Palace Gardens",
    address: { city: "Mysore", state: "Karnataka", country: "India", pincode: "570001" },
    description: "Royal luxury in the city of palaces, complete with lush green lawns.",
    amenities: ["Free WiFi", "Garden", "Spa", "Pool", "Fine Dining"],
    photos: ["https://images.unsplash.com/photo-1528659223383-7d800ad43fdd?fit=crop&w=800&q=80"],
    rating: 4.8,
    isActive: true,
    location: { type: "Point", coordinates: [76.6394, 12.2958] }
});
rooms.push({
    hotelId: h30Id,
    title: "Garden Suite",
    roomType: "suite",
    pricePerNight: 9500,
    totalRooms: 8,
    guestCapacity: 3,
    amenities: ["King Bed", "Garden View", "AC", "Bathtub", "Private Patio"],
    image: "https://images.unsplash.com/photo-1598928506311-c55dd1b46f56?fit=crop&w=800&q=80",
    photos: ["https://images.unsplash.com/photo-1598928506311-c55dd1b46f56"],
    isAvailable: true
});

module.exports = { hotels, rooms };
