import { createSlice, createAsyncThunk, isRejectedWithValue } from '@reduxjs/toolkit';
import api from '../../services/api';


export const addReviews = createAsyncThunk(
    'reviews',
    async ({ reviewData }, { rejectWithValue }) => {
        try {
            const response = await api.reviews.add(reviewData);
            if (response.success) {
                return response.review;
            } else {
                return rejectWithValue(response.message);
            }
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message || 'Failed to add review');
        }
    }
)

export const getReviews = createAsyncThunk(
    'reviews/getReviews',
    async ({ id }, { rejectWithValue }) => {
        try {
            const response = await api.reviews.getByHotel(id)
            if (response.success) {
                return response.reviews;
            } else {
                return rejectWithValue(response.message);
            }
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message || 'Failed to get reviews');
        }
    }
)

export const getAllReviews = createAsyncThunk(
    'reviews/getAllReviews',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.reviews.getAll();
            if (response.success) {
                return response.reviews;
            } else {
                return rejectWithValue(response.message);
            }
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message || 'Failed to fetch all reviews');
        }
    }
)

export const updateReview = createAsyncThunk(
    'reviews/updateReview',
    async ({ id, reviewData }, { rejectWithValue }) => {
        try {
            const response = await api.reviews.update(id, reviewData);
            if (response.success) {
                return response.review;
            } else {
                return rejectWithValue(response.message);
            }
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message || 'Failed to update review');
        }
    }
)

export const deleteReview = createAsyncThunk(
    'reviews/deleteReview',
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.reviews.delete(id);
            if (response.success) {
                return id;
            } else {
                return rejectWithValue(response.message);
            }
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message || 'Failed to delete review');
        }
    }
)

const initialState = {
    reviews: [],
    loading: false,
    error: null
}

const reviewSlice = createSlice({
    name: 'review',
    initialState,
    reducers: {
        clearReview(state) {
            state.reviews = [];
        },
        viewReview(state, action) {
            state.reviews = action.payload;
            state.loading = false;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(addReviews.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addReviews.fulfilled, (state, action) => {
                state.loading = false;
                state.reviews.push(action.payload);
            })
            .addCase(addReviews.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(getReviews.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getReviews.fulfilled, (state, action) => {
                state.loading = false;
                state.reviews = action.payload;
            })
            .addCase(getReviews.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(getAllReviews.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAllReviews.fulfilled, (state, action) => {
                state.loading = false;
                state.reviews = action.payload;
            })
            .addCase(getAllReviews.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(updateReview.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.reviews.findIndex(r => r._id === action.payload._id);
                if (index !== -1) {
                    state.reviews[index] = action.payload;
                }
            })
            .addCase(deleteReview.fulfilled, (state, action) => {
                state.loading = false;
                state.reviews = state.reviews.filter(r => r._id !== action.payload);
            });
    }
})

export const { clearReview, viewReview } = reviewSlice.actions;
export default reviewSlice.reducer;