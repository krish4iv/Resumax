/**
 * Protects routes that are meant to be called by our own Python
 * microservices, not by browsers directly. The caller must send a shared
 * secret in X-Internal-Key that matches INTERNAL_API_KEY in the Node .env.
 *
 * This is a stopgap, not a full solution — a leaked/committed
 * INTERNAL_API_KEY would defeat it. If these services ever leave your
 * local machine, put them on a private network in addition to this check.
 */
const internalAuthMiddleware = (req, res, next) => {
  const key = req.headers["x-internal-key"]

  if (!process.env.INTERNAL_API_KEY) {
    console.error(
      "INTERNAL_API_KEY is not set — refusing all internal-service requests until it is."
    )
    return res.status(500).json({ message: "Server misconfigured" })
  }

  if (!key || key !== process.env.INTERNAL_API_KEY) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  next()
}

export default internalAuthMiddleware