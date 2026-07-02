import { useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../config/firebase.js'
import { useDispatch } from 'react-redux'
import { setUser, clearAuth, setInitialized } from '../store/slice/authSlice.js'
import api from '../services/api.service.js'

export const useAuth = () => {
  const dispatch = useDispatch()
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('🔥 Firebase auth state changed:', user?.email)
      if (user) {
        try {
          console.log('📡 Fetching user from backend...')
          const token = await user.getIdToken()
          const response = await api.get('/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          })
          console.log('✅ Backend user:', response.data.user)
          dispatch(setUser(response.data.user))
        } catch (error) {
          console.error('❌ Failed:', error.message)
          dispatch(clearAuth())
        }
      } else {
        console.log('👋 No user — clearing auth')
        dispatch(clearAuth())
      }
      dispatch(setInitialized())
    })
    return () => unsubscribe()
  }, [dispatch])
}