/**
 * requireRole('admin') -> middleware factory.
 * Must run AFTER authMiddleware (needs req.user already set from the
 * verified Firebase token) — but note authMiddleware only decodes the
 * Firebase token, it doesn't attach your DB `role` column. This looks up
 * the DB user once per request to check the actual role.
 *
 * If this route gets hit often, consider caching role lookups (e.g. a
 * short-TTL in-memory map keyed by uid) instead of hitting Postgres on
 * every single request — flagging for later, not blocking this fix.
 */
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