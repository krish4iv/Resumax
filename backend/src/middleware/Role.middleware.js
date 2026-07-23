
import { User } from "../models/index.js"

const requireRole = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      const user = await User.findOne({ where: { firebase_uid: req.user.uid } })
      if (!user) return res.status(404).json({ message: "User not found" })

      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({ message: "Forbidden" })
      }

      req.dbUser = user
      next()
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message })
    }
  }
}

export default requireRole