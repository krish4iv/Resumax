/**
 * Wraps an async route handler so thrown errors/rejected promises are
 * forwarded to Express's error-handling middleware instead of needing a
 * try/catch in every single controller function.
 *
 * Usage:
 *   router.get('/', asyncHandler(controller.getAllResumes))
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

export default asyncHandler