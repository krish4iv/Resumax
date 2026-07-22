import { ChevronLeft, ChevronRight } from 'lucide-react'

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null

  return (
    <div className="flex justify-center mt-6">
      <div className="flex items-center gap-2">
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={18} />
        </button>
        <p className="text-sm font-medium text-slate-300">
          Page {currentPage} of {totalPages}
        </p>
        <button
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  )
}

export default Pagination