import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

let storedUser = null;
let storedToken = null;
try {
  storedUser = JSON.parse(localStorage.getItem("tr_user") || "null");
  storedToken = localStorage.getItem("tr_token") || null;
} catch (e) {
  storedUser = null;
  storedToken = null;
}

// ─── Async thunks ─────────────────────────────────────────
export const registerUser = createAsyncThunk(
  "auth/register",
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post("/auth/register", data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Registration failed");
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post("/auth/login", data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Login failed");
    }
  }
);

export const fetchMe = createAsyncThunk("auth/me", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get("/auth/me");
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Session expired");
  }
});

export const initializeAuth = createAsyncThunk(
  "auth/initialize",
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem("tr_token");
    if (!token) return rejectWithValue("No token");
    try {
      const res = await api.get("/auth/me");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Auth initialization failed");
    }
  }
);

// ─── Slice ────────────────────────────────────────────────
const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: storedUser,
    token: storedToken,
    loading: false,
    error: null,
    authReady: false,
  },
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      localStorage.removeItem("tr_user");
      localStorage.removeItem("tr_token");
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const handlePending = (state) => {
      state.loading = true;
      state.error = null;
    };
    const handleFulfilled = (state, action) => {
      state.loading = false;
      state.authReady = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      localStorage.setItem("tr_user", JSON.stringify(action.payload.user));
      localStorage.setItem("tr_token", action.payload.token);
    };
    const handleRejected = (state, action) => {
      state.loading = false;
      state.authReady = true;
      state.error = action.payload;
    };

    builder
      .addCase(registerUser.pending, handlePending)
      .addCase(registerUser.fulfilled, handleFulfilled)
      .addCase(registerUser.rejected, handleRejected)
      .addCase(loginUser.pending, handlePending)
      .addCase(loginUser.fulfilled, handleFulfilled)
      .addCase(loginUser.rejected, handleRejected)
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.authReady = true;
      })
      .addCase(fetchMe.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.authReady = true;
        localStorage.removeItem("tr_user");
        localStorage.removeItem("tr_token");
      })
      .addCase(initializeAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.authReady = true;
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.loading = false;
        state.error = null;
        state.user = null;
        state.token = null;
        state.authReady = true;
        localStorage.removeItem("tr_user");
        localStorage.removeItem("tr_token");
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
