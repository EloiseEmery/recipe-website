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
    <form onSubmit={handleSubmit} className="flex w-full max-w-xl gap-2">
      <input
        type="text"
        placeholder="Search recipes..."
        value={value}
        onChange={handleChange}
        className="search-input w-full rounded-md border border-gray-300 px-4 py-2 placeholder-gray-400 outline-none focus:border-blue-400"
      />
      <button
        type="submit"
        className="rounded-md bg-blue-500 px-4 py-2 font-medium text-white transition hover:bg-blue-600"
      >
        Search
      </button>
    </form>
  );
}

export default SearchBar;
