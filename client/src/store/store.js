import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import reviewReducer from './slices/reviewSlice';
import wishlistReducer from './slices/wishlistSlice'

export const store = configureStore({
    reducer: {
        auth: authReducer,
        review: reviewReducer,
        wishlist:wishlistReducer,
    },
});