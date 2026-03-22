import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async Thunks
export const registerUser = createAsyncThunk(
    'auth/register',
    async (userData, { rejectWithValue }) => {
        try {
            const response = await api.auth.register(userData);
            if (response.success) {
                // Return success message but no token yet
                return { message: response.message, email: response.email };
            } else {
                return rejectWithValue(response.message);
            }
        } catch (err) {
            return rejectWithValue(err.errors ? { message: err.message, errors: err.errors } : err.message || 'Registration failed');
        }
    }
);

export const verifyOTP = createAsyncThunk(
  'auth/verifyOTP',
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const data = await api.auth.verifyOTP(email, otp);
      if (data.success && data.token) {
        localStorage.setItem('token', data.token);
        return { user: data.user, token: data.token };
      } else {
        return rejectWithValue(data.message || 'Verification failed');
      }
    } catch (err) {
      return rejectWithValue(err.message || 'Verification failed');
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const data = await api.auth.login(email, password);
      // We check for isUnverified if we want to redirect to OTP page
      if (!data.success) {
        return rejectWithValue({ 
          message: data.message, 
          isUnverified: data.isUnverified,
          email: email 
        });
      }

      const user = data.user || data.admin || data.owner;
      localStorage.setItem('token', data.token);
      return { user, token: data.token };
    } catch (err) {
      // Handle the case where the error response contains isUnverified
      const errorMsg = err.message || 'Login failed';
      if (err.originalError?.response?.status === 403 && err.originalError?.response?.data?.isUnverified) {
        return rejectWithValue({
          message: errorMsg,
          isUnverified: true,
          email: email
        });
      }
      return rejectWithValue(err.errors ? { message: errorMsg, errors: err.errors } : errorMsg);
    }
  }
);


export const loadUser = createAsyncThunk(
    'auth/loadUser',
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return rejectWithValue('No token found');

            const response = await api.auth.getMe();
            if (response.success) {
                return response.user;
            } else {
                localStorage.removeItem('token');
                return rejectWithValue('Session expired');
            }
        } catch (err) {
            localStorage.removeItem('token');
            return rejectWithValue(err.message || 'Failed to load user');
        }
    }
);

const token = localStorage.getItem('token');

const initialState = {
    user: null,
    token,
    isAuthenticated: !!token,
    // Only treat app as "loading auth" when a token exists and user hydration is expected.
    loading: !!token,
    error: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logoutUser: (state) => {
            localStorage.removeItem('token');
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.loading = false;
            state.error = null;
            state.isUnverified = false;
        },
        clearErrors: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Register
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state) => {
                state.loading = false;
                state.isAuthenticated = false;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Verify OTP
            .addCase(verifyOTP.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(verifyOTP.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.token = action.payload.token;
            })
            .addCase(verifyOTP.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Login
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.isUnverified = false;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.isUnverified = false;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = typeof action.payload === 'object' ? action.payload.message : action.payload;
                state.isUnverified = action.payload?.isUnverified;
            })
            // Load User
            .addCase(loadUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loadUser.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.user = action.payload;
            })
            .addCase(loadUser.rejected, (state) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.user = null;
                state.token = null;
            });
    },
});

export const { logoutUser, clearErrors } = authSlice.actions;
export default authSlice.reducer;
