/** "Previous / Page 2 of 5 / Next". Renders nothing when there is only one page. */
export default function Pagination({ page, totalPages, onChange, disabled = false }) {
  if (!totalPages || totalPages <= 1) return null;

  return (
    <nav className="pagination" aria-label="Pagination">
      <button
        type="button"
        className="btn btn-sm"
        // Math.min handles someone opening ?page=99 on a 3-page list.
        onClick={() => onChange(Math.min(page - 1, totalPages))}
        disabled={disabled || page <= 1}
      >
        ← Previous
      </button>
      <span aria-live="polite">
        Page {page} of {totalPages}
      </span>
      <button
        type="button"
        className="btn btn-sm"
        onClick={() => onChange(page + 1)}
        disabled={disabled || page >= totalPages}
      >
        Next →
      </button>
    </nav>
  );
}
