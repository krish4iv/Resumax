/**
 * Centralized error handler — must be the LAST app.use() in server.js.
 * Logs the real error server-side, returns a generic message to the
 * client so Sequelize/Postgres internals never leak in a response.
 */
const errorHandler = (err, req, res, next) => {
  console.error(`[${req.method} ${req.originalUrl}]`, err)

  // Sequelize validation errors are safe (and useful) to surface as-is
  if (err.name === "SequelizeValidationError" || err.name === "SequelizeUniqueConstraintError") {
    return res.status(400).json({
      message: "Validation error",
      errors: err.errors?.map((e) => e.message),
    })
  }

  const status = err.status || err.statusCode || 500
  const isServerError = status >= 500

  res.status(status).json({
    message: isServerError ? "Something went wrong. Please try again." : err.message,
  })

}

export default errorHandler