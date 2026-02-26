import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from '../../services/api'

const initialState = {
    items:[],
    wishlistedHotels: [],
    loading:false,
}

export const fetchWishlist = createAsyncThunk('wishlist/fetch',
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.wishlist.getMyWishlist();
            return res.wishlist;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch wishlist');
        }
    }
);

export const toggleWishlist = createAsyncThunk('wishlist/toggle',
    async (payload, { rejectWithValue }) =>{
        const hotelId = typeof payload === 'object' ? payload?.hotelId : payload;
        try {
            const res = await api.wishlist.toggle(hotelId);
            return {hotelId,wishlist:res.wishlist,hotel:payload?.hotel};
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to toggle wishlist');
        }
    }
);

const wishlistSlice = createSlice({
    name:'wishlist',
    initialState,
    reducers:{
       toggleWishlistLocal:(state,action)=>{
        const payload = action.payload;
        const hotelId = typeof payload === 'object' ? payload?.hotelId : payload;
        const hotel = typeof payload === 'object' ? payload?.hotel : null;
        const exists = state.items.includes(hotelId)

        if(exists){
            state.items = state.items.filter(id => id !== hotelId)
            state.wishlistedHotels = state.wishlistedHotels.filter(hotel => hotel._id !== hotelId)
        }else{
            state.items.push(hotelId)
            if (hotel && !state.wishlistedHotels.some(h => h._id === hotelId)) {
                state.wishlistedHotels.push(hotel)
            }
        }
        
       },
       clearWishlist:(state) =>{
        state.items= []
        state.wishlistedHotels = []
       }
    },
    extraReducers:(builder) =>{
        builder
            .addCase(fetchWishlist.pending,(state)=>{
                state.loading = true;
            })
            .addCase(fetchWishlist.fulfilled,(state,action)=>{
                const hotels = action.payload || [];
                state.wishlistedHotels = hotels;
                state.items = hotels.map(hotel=>hotel._id || hotel);
                state.loading = false;
            })
            .addCase(fetchWishlist.rejected,(state)=>{
                state.loading = false
            })
            .addCase(toggleWishlist.pending, (state, action) => {
                // Optimistic toggle using the same reducer logic
                wishlistSlice.caseReducers.toggleWishlistLocal(state, { payload: action.meta.arg })
            })
            .addCase(toggleWishlist.fulfilled, (state, action) => {
                const wishlist = action.payload?.wishlist;
                if (!wishlist) return;

                const isObjectList = Array.isArray(wishlist) && wishlist.length > 0 && typeof wishlist[0] === 'object';
                if (isObjectList) {
                    state.wishlistedHotels = wishlist;
                    state.items = wishlist.map(hotel => hotel._id || hotel);
                } else {
                    state.items = wishlist;
                    state.wishlistedHotels = state.wishlistedHotels.filter(hotel =>
                        wishlist.includes(hotel._id)
                    );
                }
            })
            .addCase(toggleWishlist.rejected, (state, action) => {
                // Roll back optimistic change on failure
                wishlistSlice.caseReducers.toggleWishlistLocal(state, { payload: action.meta.arg })
            })
    }
})

export const {toggleWishlistLocal,clearWishlist} = wishlistSlice.actions
export default wishlistSlice.reducer
