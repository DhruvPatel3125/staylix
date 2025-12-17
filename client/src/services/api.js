import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const instance = axios.create({
  baseURL: API_URL
});

instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    } else {
      config.headers['Content-Type'] = 'application/json';
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

const api = {
  auth: {
    register: async (name, email, password, role = 'user') => {
      const response = await instance.post('/auth/register', { name, email, password, role });
      return response.data;
    },

    login: async (email, password) => {
      const response = await instance.post('/auth/login', { email, password });
      return response.data;
    },

    getMe: async () => {
      const response = await instance.get('/auth/me');
      return response.data;
    }
  },

  hotels: {
    getAll: async () => {
      const response = await instance.get('/hotels');
      return response.data;
    },

    getById: async (id) => {
      const response = await instance.get(`/hotels/${id}`);
      return response.data;
    },

    create: async (hotelData) => {
      const response = await instance.post('/hotels', hotelData);
      return response.data;
    },

    update: async (id, hotelData) => {
      const response = await instance.put(`/hotels/${id}`, hotelData);
      return response.data;
    },

    delete: async (id) => {
      const response = await instance.delete(`/hotels/${id}`);
      return response.data;
    },

    getOwnerHotels: async () => {
      const response = await instance.get('/hotels/owner/my-hotels');
      return response.data;
    }
  },

  rooms: {
    getByHotel: async (hotelId) => {
      const response = await instance.get(`/rooms/${hotelId}`);
      return response.data;
    },

    create: async (roomData) => {
      const response = await instance.post('/rooms', roomData);
      return response.data;
    },

    update: async (id, roomData) => {
      const response = await instance.put(`/rooms/${id}`, roomData);
      return response.data;
    },

    delete: async (id) => {
      const response = await instance.delete(`/rooms/${id}`);
      return response.data;
    },

    getOwnerRooms: async () => {
      const response = await instance.get('/rooms/owner/all');
      return response.data;
    },

    toggleAvailability: async (id) => {
      const response = await instance.put(`/rooms/${id}/toggle`);
      return response.data;
    },

    createRequest: async (requestData) => {
      const response = await instance.post('/rooms/request/create', requestData);
      return response.data;
    },

    getOwnerRequests: async () => {
      const response = await instance.get('/rooms/request/all');
      return response.data;
    }
  },

  bookings: {
    create: async (bookingData) => {
      const response = await instance.post('/bookings', bookingData);
      return response.data;
    },

    getMyBookings: async () => {
      const response = await instance.get('/bookings/my');
      return response.data;
    },

    getOwnerBookings: async () => {
      const response = await instance.get('/bookings/owner');
      return response.data;
    },

    cancel: async (id) => {
      const response = await instance.put(`/bookings/cancel/${id}`);
      return response.data;
    }
  },

  reviews: {
    add: async (reviewData) => {
      const response = await instance.post('/reviews', reviewData);
      return response.data;
    },

    getByHotel: async (hotelId) => {
      const response = await instance.get(`/reviews/${hotelId}`);
      return response.data;
    }
  },

  ownerRequest: {
    create: async (requestData) => {
      const response = await instance.post('/owner-request', requestData);
      return response.data;
    },

    getAll: async () => {
      const response = await instance.get('/owner-request');
      return response.data;
    },

    approve: async (id) => {
      const response = await instance.put(`/owner-request/approve/${id}`);
      return response.data;
    },

    reject: async (id) => {
      const response = await instance.put(`/owner-request/reject/${id}`);
      return response.data;
    }
  },

  admin: {
    getDashboardStats: async () => {
      const response = await instance.get('/admin/stats');
      return response.data;
    },

    getAllUsers: async () => {
      const response = await instance.get('/admin/users');
      return response.data;
    },

    blockUser: async (id) => {
      const response = await instance.put(`/admin/users/block/${id}`);
      return response.data;
    },

    deleteUser: async (id) => {
      const response = await instance.delete(`/admin/users/${id}`);
      return response.data;
    },

    getAllHotels: async () => {
      const response = await instance.get('/admin/hotels');
      return response.data;
    },

    deleteHotel: async (id) => {
      const response = await instance.delete(`/admin/hotels/${id}`);
      return response.data;
    },

    getAllRooms: async () => {
      const response = await instance.get('/admin/rooms');
      return response.data;
    },

    deleteRoom: async (id) => {
      const response = await instance.delete(`/admin/rooms/${id}`);
      return response.data;
    },

    getOwnerRequests: async () => {
      const response = await instance.get('/admin/owner-requests');
      return response.data;
    },

    approveOwnerRequest: async (id) => {
      const response = await instance.put(`/admin/owner-requests/approve/${id}`);
      return response.data;
    },

    rejectOwnerRequest: async (id) => {
      const response = await instance.put(`/admin/owner-requests/reject/${id}`);
      return response.data;
    },

    getRoomRequests: async () => {
      const response = await instance.get('/admin/room-requests');
      return response.data;
    },

    approveRoomRequest: async (id) => {
      const response = await instance.put(`/admin/room-requests/approve/${id}`);
      return response.data;
    },

    rejectRoomRequest: async (id, reason) => {
      const response = await instance.put(`/admin/room-requests/reject/${id}`, { reason });
      return response.data;
    }
  },

  discounts: {
    create: async (discountData) => {
      const response = await instance.post('/discounts', discountData);
      return response.data;
    },

    getAll: async () => {
      const response = await instance.get('/discounts');
      return response.data;
    },

    getById: async (id) => {
      const response = await instance.get(`/discounts/${id}`);
      return response.data;
    },

    update: async (id, discountData) => {
      const response = await instance.put(`/discounts/${id}`, discountData);
      return response.data;
    },

    delete: async (id) => {
      const response = await instance.delete(`/discounts/${id}`);
      return response.data;
    },

    toggle: async (id) => {
      const response = await instance.put(`/discounts/${id}/toggle`);
      return response.data;
    },

    // Owner requests a discount
    request: async (discountData) => {
      const response = await instance.post('/discounts/request', discountData);
      return response.data;
    },

    // Get owner's discount requests
    getMyRequests: async () => {
      const response = await instance.get('/discounts/owner/requests');
      return response.data;
    },

    // Admin approves discount request
    approveRequest: async (id) => {
      const response = await instance.put(`/discounts/${id}/approve`);
      return response.data;
    },

    // Admin rejects discount request
    rejectRequest: async (id, reason) => {
      const response = await instance.put(`/discounts/${id}/reject`, { reason });
      return response.data;
    },

    // Validate discount code
    validate: async (code, bookingAmount, hotelId) => {
      const response = await instance.post('/discounts/validate', { code, bookingAmount, hotelId });
      return response.data;
    },

    // Get active discounts
    getActive: async () => {
      const response = await instance.get('/discounts/active');
      return response.data;
    }
  }
};

export default api;
