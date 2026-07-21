// src/components/documents/utils.js

export function formatDate(value) {
  if (!value) return "—"
  try {
    return new Date(value).toLocaleDateString(undefined, {
      year: "numeric", month: "short", day: "numeric",
    })
  } catch {
    return value
  }
}

export function clampScore(v, max = 100) {
  const n = Number(v)
  if (Number.isNaN(n)) return 0
  return Math.max(0, Math.min(max, Math.round(n)))
}