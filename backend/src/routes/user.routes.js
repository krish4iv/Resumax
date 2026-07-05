import express from 'express'
import { User } from '../models/index.js'

const router = express.Router()

// Internal route — no auth needed (called by Python services)
router.get('/:firebase_uid', async (req, res) => {
  try {
    const user = await User.findOne({
      where: { firebase_uid: req.params.firebase_uid }
    })
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json({ user })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

export default router