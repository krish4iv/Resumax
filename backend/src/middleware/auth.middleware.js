import { adminAuth } from '../config/firebase.js'


const authMiddleware = async (req, res, next) => {
  try {
    // token = bearer shefosjefslkv (example)
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) return res.status(401).json({ message: 'Unauthorized' })
    
    const decodedToken = await adminAuth.verifyIdToken(token)
    req.user = decodedToken
    next()
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' })
  }
}

export default authMiddleware;