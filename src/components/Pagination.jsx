function Pagination({
  totalResults = 0,
  offset = 0,
  pageSize = 5,
  onPageChange,
  isDisabled = false
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

  return (
    <nav aria-label="Pagination" className="">
      <button
        type="button"
        onClick={() => goToPage(currentPage - 1)}
        disabled={isDisabled || currentPage === 1}
      >
        Previous
      </button>

      {pages.map((page, index) =>
        page === '...' ? (
          <span key={`dots-${index}`} aria-hidden="true">
            ...
          </span>
        ) : (
          <button
            key={page}
            type="button"
            onClick={() => goToPage(page)}
            disabled={isDisabled || page === currentPage}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </button>
        )
      )}

      <button
        type="button"
        onClick={() => goToPage(currentPage + 1)}
        disabled={isDisabled || currentPage === totalPages}
      >
        Next
      </button>
    </nav>
  );
}

export default Pagination;
