function Pagination({
  totalResults = 0,
  offset = 0,
  pageSize = 5,
  onPageChange,
  isDisabled = false,
}) {
  if (
    !pageSize ||
    totalResults <= pageSize ||
    typeof onPageChange !== 'function'
  ) {
    return null;
  }

  const totalPages = Math.ceil(totalResults / pageSize);
  const currentPage = Math.min(
    Math.max(Math.floor(offset / pageSize) + 1, 1),
    totalPages
  );

  const pages = [];

  for (let page = 1; page <= totalPages; page += 1) {
    const shouldShowPage =
      page === 1 ||
      page === totalPages ||
      Math.abs(page - currentPage) <= 1;

    if (shouldShowPage) {
      pages.push(page);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  const goToPage = (page) => {
    if (isDisabled || page < 1 || page > totalPages || page === currentPage) {
      return;
    }

    onPageChange((page - 1) * pageSize);
  };

  const buttonClasses =
    'inline-flex h-10 min-w-10 items-center justify-center rounded-xl border px-3 text-sm font-medium transition';
  const idleClasses =
    'border-stone-200 bg-white text-stone-700 hover:border-amber-300 hover:text-amber-700';
  const activeClasses =
    'border-stone-900 bg-stone-900 text-white shadow-sm hover:bg-stone-800';
  const disabledClasses = 'disabled:cursor-not-allowed disabled:opacity-50';

  return (
    <nav
      aria-label="Pagination"
      className="mt-10 flex flex-wrap items-center justify-center gap-2"
    >
      <button
        type="button"
        onClick={() => goToPage(currentPage - 1)}
        disabled={isDisabled || currentPage === 1}
        className={`${buttonClasses} ${idleClasses} ${disabledClasses}`}
      >
        Previous
      </button>

      {pages.map((page, index) =>
        page === '...' ? (
          <span
            key={`dots-${index}`}
            aria-hidden="true"
            className="inline-flex h-10 min-w-10 items-center justify-center text-sm font-semibold text-stone-400"
          >
            ...
          </span>
        ) : (
          <button
            key={page}
            type="button"
            onClick={() => goToPage(page)}
            disabled={isDisabled}
            aria-current={page === currentPage ? 'page' : undefined}
            className={`${buttonClasses} ${
              page === currentPage ? activeClasses : idleClasses
            } ${disabledClasses}`}
          >
            {page}
          </button>
        )
      )}

      <button
        type="button"
        onClick={() => goToPage(currentPage + 1)}
        disabled={isDisabled || currentPage === totalPages}
        className={`${buttonClasses} ${idleClasses} ${disabledClasses}`}
      >
        Next
      </button>
    </nav>
  );
}

export default Pagination;
