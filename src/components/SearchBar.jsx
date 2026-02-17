function SearchBar({
  value,
  onChange,
  onSubmit,
  isIngredientsMode = false,
  onIngredientsModeChange,
  ingredientsValue = '',
  onIngredientsChange,
  mobileCuisineFilter = null,
  isLoading = false,
  isButtonLoading = false,
}) {
  /**
   * Handle input value change
   * @param {Event} e - Input change event
   */
  const handleChange = (e) => {
    onChange(e.target.value);
  };

  /**
   * Handle form submission
   * @param {Event} e - Form submission event
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full flex-col gap-3 lg:min-w-0 lg:flex-1"
    >
      <div className="flex w-full flex-col gap-3 sm:flex-row">
        {isIngredientsMode ? (
          <>
            <label htmlFor="available-ingredients" className="sr-only">
              Available ingredients
            </label>
            <input
              id="available-ingredients"
              type="text"
              placeholder="tomato, rice, chicken"
              value={ingredientsValue}
              onChange={(e) => onIngredientsChange?.(e.target.value)}
              disabled={isLoading}
              className="h-12 w-full rounded-2xl border border-emerald-200 bg-emerald-50/50 px-4 text-sm text-stone-700 placeholder:text-stone-400 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-65"
            />
          </>
        ) : (
          <>
            <label htmlFor="recipe-search" className="sr-only">
              Search recipes
            </label>
            <input
              id="recipe-search"
              type="text"
              placeholder="Search by recipes..."
              value={value}
              onChange={handleChange}
              disabled={isLoading}
              className="h-12 w-full rounded-2xl border border-amber-200/80 bg-white px-4 text-sm text-stone-700 placeholder:text-stone-400 shadow-sm outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100 disabled:cursor-not-allowed disabled:bg-stone-100 disabled:opacity-75"
            />
          </>
        )}

        {!isIngredientsMode && mobileCuisineFilter}

        <button
          type="submit"
          disabled={isLoading}
          className="cursor-pointer inline-flex h-12 shrink-0 items-center justify-center rounded-2xl bg-stone-900 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-stone-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-stone-300 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-stone-700/80 disabled:shadow-none"
        >
          {isButtonLoading ? (
            <span className="inline-flex items-center gap-2">
              <span
                aria-hidden="true"
                className="size-4 animate-spin rounded-full border-2 border-white/35 border-t-white"
              />
              Searching...
            </span>
          ) : (
            'Search'
          )}
        </button>
      </div>

      <div>
        <label className="cursor-pointer inline-flex h-12 w-full shrink-0 items-center gap-3 rounded-2xl bg-white px-4 text-sm text-stone-700 lg:w-auto">
          <input
            type="checkbox"
            checked={isIngredientsMode}
            disabled={isLoading}
            onChange={(e) => onIngredientsModeChange?.(e.target.checked)}
            className="size-4 rounded border-stone-300 text-stone-900 focus:ring-amber-300 disabled:cursor-not-allowed"
          />
          Search by ingredients
        </label>
        {isIngredientsMode && (
          <p className="text-[13px] text-stone-600 pt-3">
            Enter ingredients separated by commas.
          </p>
        )}
      </div>
    </form>
  );
}

export default SearchBar;
