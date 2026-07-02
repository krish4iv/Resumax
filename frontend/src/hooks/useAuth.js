import { useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../config/firebase.js'
import { useDispatch } from 'react-redux'
import { setUser, clearAuth } from '../store/slice/authSlice.js'

export const useAuth = () => {
  const dispatch = useDispatch()
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        dispatch(setUser({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
        }))
      } else {
        dispatch(clearAuth())
      }
    })
    
    return () => unsubscribe()
  }, [dispatch])
  
}
