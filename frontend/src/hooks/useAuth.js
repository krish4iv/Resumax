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
            if (error.response?.status === 404) {
              // Backend has no row for this firebase_uid yet — self-heal by
              // creating it now, using data Firebase already has
              try {
                const registerResponse = await api.post('/auth/register', {
                  firebase_uid: user.uid,
                  email: user.email,
                  name: user.displayName || user.email.split('@')[0],
                })
                dispatch(setUser(registerResponse.data.user))
              } catch (registerError) {
                console.error('❌ Self-heal registration failed:', registerError.message)
                dispatch(clearAuth())
              }
            } else {
              console.error('❌ Failed:', error.message)
              dispatch(clearAuth())
            }
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