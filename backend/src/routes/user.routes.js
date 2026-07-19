import express from 'express'
import { User } from '../models/index.js'
import internalAuthMiddleware from '../middleware/internalAuth.middleware.js'

const router = express.Router()

// Internal route — called by job_recommendation / skill_analysis to

router.get('/:firebase_uid', internalAuthMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({
      where: { firebase_uid: req.params.firebase_uid },
      // Only return what the Python services actually need — no reason to
      // hand back email, comp_floor, etc. to a service that only needs skills.
      attributes: ['firebase_uid', 'name', 'skills', 'preferred_role', 'target_companies', 'industries'],
    })
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json({ user })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

export default router