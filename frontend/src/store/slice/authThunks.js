
import { auth } from '../../config/firebase.js'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import api from '../../services/api.service.js'
import { createAsyncThunk } from '@reduxjs/toolkit'


export const registerUser = createAsyncThunk('/auth/register', async ({email, password, name}, {rejectWithValue}) => {
   try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const firebase_uid = userCredential.user.uid;

        try {
          const response = await api.post('/auth/register', { firebase_uid, email, name });
          return response.data.user;
        } catch (backendError) {
          await userCredential.user.delete().catch(() => {})
          throw backendError
        }

   } catch (error) {
    return rejectWithValue(error.response?.data?.message || error.message);
   }
})

export const loginUser = createAsyncThunk('/auth/login', async ({email, password},{rejectWithValue}) => {
   try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const firebase_uid = userCredential.user.uid;

        const response = await api.post('/auth/login', {
            firebase_uid,
            email
        });
        
        return response.data.user;

   } catch (error) {
    return rejectWithValue(error.message);
   }
})

export const logoutUser = createAsyncThunk('auth/logout', async (_, {rejectWithValue, dispatch}) => {
   try {
        await signOut(auth);
        return true;
   } catch (error) {
    return rejectWithValue(error.message);
   }
})