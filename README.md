# Staylix - Hotel Booking Platform

Staylix is a comprehensive full-stack web application designed for hotel bookings and management. It connects users searching for accommodation with property owners, while providing a robust administration interface for platform management.

## 🌟 Features

- **User Roles**: Separate interfaces and functionalities for Users, Property Owners, and Admins.
- **Authentication**: Secure JWT-based authentication and authorization.
- **Hotel & Room Management**: Owners can list hotels, manage rooms, and handle availability.
- **Booking System**: Seamless booking flow for users with real-time status updates.
- **Discount System**: Admin and Owner managed discount codes and validations.
- **Reviews & Ratings**: User-generated reviews for hotels.
- **Admin Dashboard**: Comprehensive stats, user management, and content moderation.
- **Responsive Design**: Built with React and structured CSS for a seamless experience across devices.

## 🛠 Tech Stack

### Client-Side
- **React** (v19): Modern UI library for building interactive interfaces.
- **Vite**: Fast build tool and development server.
- **Axios**: HTTP client for API requests.
- **React Router**: Client-side routing.
- **Context API**: State management.

### Server-Side
- **Node.js**: JavaScript runtime environment.
- **Express**: Web framework for Node.js.
- **MongoDB**: NoSQL database for flexible data storage.
- **Mongoose**: ODM library for MongoDB and Node.js.
- **JWT**: JSON Web Tokens for secure authentication.
- **Multer**: Middleware for handling file uploads (images).

## 🚀 Getting Started

Follow these instructions to set up the project locally.

### Prerequisites
- **Node.js** (v14 or higher)
- **MongoDB** (Local instance or Atlas URI)

### Installation

#### 1. Clone the Repository
```bash
git clone <repository-url>
cd staylix
```

#### 2. Server Setup
Navigate to the server directory and install dependencies:
```bash
cd server
npm install
```

Create a `.env` file in the `server` directory with the following variables:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/staylix  # Or your MongoDB Atlas URI
JWT_SECRET=your_super_secret_jwt_key
FRONTEND_URL=http://localhost:5173           # URL where your client runs
NODE_ENV=development
```
> **Note**: The client application expects the API to be running at `http://localhost:5000`. Ensure `PORT` is set to `5000`.

Start the server:
```bash
npm run dev
```

#### 3. Client Setup
Open a new terminal, navigate to the client directory and install dependencies:
```bash
cd ../client
npm install
```

Start the client development server:
```bash
npm run dev
```
The application will typically run at `http://localhost:5173`.

## 📂 Project Structure

### Server (`/server`)
- **`src/config`**: Database configuration.
- **`src/controllers`**: Request handling logic.
- **`src/models`**: Mongoose schemas (User, Hotel, Room, Booking, Discount).
- **`src/routes`**: API route definitions.
- **`src/middlewares`**: Auth and error handling middlewares.
- **`uploads`**: Directory for uploaded images.

### Client (`/client`)
- **`src/components`**: Reusable UI components.
- **`src/pages`**: Main application pages (Home, Login, AdminDashboard, etc.).
- **`src/services`**: API service functions (`api.js`).
- **`src/context`**: Global state context providers.
- **`src/assets`**: Static assets.

## 📡 API Endpoints Overview

The API is prefixed with `/api`. Common endpoints include:

- **Auth**: `/api/auth/register`, `/api/auth/login`, `/api/auth/me`
- **Hotels**: `/api/hotels`, `/api/hotels/:id`
- **Rooms**: `/api/rooms/:hotelId`
- **Bookings**: `/api/bookings`, `/api/bookings/my`
- **Discounts**: `/api/discounts`
- **Admin**: `/api/admin/stats`, `/api/admin/users`, `/api/admin/hotels`

## 📄 License

This project is licensed under the ISC License.
