function SearchBar({ value, onChange, onSubmit }) {
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
    onSubmit(value.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-3 sm:flex-row">
      <label htmlFor="recipe-search" className="sr-only">
        Search recipes
      </label>
      <input
        id="recipe-search"
        type="text"
        placeholder="Search recipes..."
        value={value}
        onChange={handleChange}
        className="h-12 w-full rounded-2xl border border-amber-200/80 bg-white px-4 text-sm text-stone-700 placeholder:text-stone-400 shadow-sm outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
      />
      <button
        type="submit"
        className="inline-flex h-12 shrink-0 items-center justify-center rounded-2xl bg-stone-900 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-stone-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-stone-300 active:scale-[0.99]"
      >
        Search
      </button>
    </form>
  );
}

export default SearchBar;
