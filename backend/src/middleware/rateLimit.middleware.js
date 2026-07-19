import rateLimit from "express-rate-limit"

// Auth endpoints: tight limit, these are brute-force/spam targets
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts, please try again later." },
})

// General authenticated API traffic: generous, just a backstop
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please slow down." },
})

// Resume writes specifically call out to the Python AI service downstream —
// keep this tighter than general API traffic.
export const resumeWriteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many resume operations, please slow down." },
})