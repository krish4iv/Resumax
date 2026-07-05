const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="flex justify-center mt-6">
      <div className="flex items-center gap-2">
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200"
        >
          <ChevronLeft size={18} />
        </button>
        <p className="text-sm font-medium">
          Page {currentPage} of {totalPages}
        </p>
        <button
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  )
}
