import { useState, useMemo, useEffect } from 'react'

export default function usePagination(items, pageSize = 10) {
  const [page, setPage] = useState(1)

  useEffect(() => {
    setPage(1)
  }, [items])

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))

  const paged = useMemo(
    () => items.slice((page - 1) * pageSize, page * pageSize),
    [items, page, pageSize]
  )

  return { page, setPage, totalPages, paged }
}