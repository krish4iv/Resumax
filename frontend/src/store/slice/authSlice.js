import { createSlice } from '@reduxjs/toolkit'
import { registerUser, loginUser, logoutUser } from './authThunks.js'

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null,
        loading: false,
        error: null,
        initialized: false,
    },
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload
        },
        setLoading: (state, action) => {
            state.loading = action.payload
        },
        setError: (state, action) => {
            state.error = action.payload
        },
        clearAuth: (state) => {
            state.user = null
            state.loading = false
            state.error = null
        },
        setInitialized: (state) => {
            state.initialized = true
        }
    },
    extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null
        state.loading = false
        state.error = null
        state.initialized = true
      })
    }
  })

export const { setUser, setLoading, setError, clearAuth, setInitialized } = authSlice.actions
export default authSlice.reducer