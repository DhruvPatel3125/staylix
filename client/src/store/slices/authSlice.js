import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async Thunks
export const registerUser = createAsyncThunk(
    'auth/register',
    async ({ name, email, password, role }, { rejectWithValue }) => {
        try {
            const response = await api.auth.register(name, email, password, role);
            if (response.success) {
                localStorage.setItem('token', response.token);
                return { user: response.user, token: response.token };
            } else {
                return rejectWithValue(response.message);
            }
        } catch (err) {
            return rejectWithValue(err.errors ? { message: err.message, errors: err.errors } : err.message || 'Registration failed');
        }
    }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const data = await api.auth.login(email, password);
      const user = data.user || data.admin || data.owner;

      if (!data.success || !user) {
        return rejectWithValue(data.message || 'Invalid login response');
      }

      localStorage.setItem('token', data.token);
      return { user, token: data.token };
    } catch (err) {
      return rejectWithValue(err.errors ? { message: err.message, errors: err.errors } : err.message || 'Login failed');
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
            .addCase(registerUser.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;        
                state.user = action.payload.user;
                state.token = action.payload.token;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Login
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.token = action.payload.token;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
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
                state.token = null; // Token removed in thunk
                // state.error = action.payload; // Typically don't show error on auto-load failure
            });
    },
});

export const { logoutUser, clearErrors } = authSlice.actions;
export default authSlice.reducer;
