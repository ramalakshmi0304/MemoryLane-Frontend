import React from "react";

const Pagination = ({ page, setPage, totalPages }) => {
  return (
    <div className="flex justify-center gap-4 mt-4">
      <button
        disabled={page === 1}
        onClick={() => setPage(page - 1)}
        className="px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded-lg disabled:opacity-50"
      >
        Prev
      </button>

      <span className="text-lg dark:text-white">
        {page} / {totalPages || "?"}
      </span>

      <button
        disabled={totalPages && page === totalPages}
        onClick={() => setPage(page + 1)}
        className="px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded-lg disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
