import { CUISINES } from '../constants/cuisines';

function FilterCuisine({ value, onChange }) {
  return (
    <div className="relative w-full sm:max-w-xs">
      <label htmlFor="cuisine-filter" className="sr-only">
        Filter by cuisine
      </label>
      <select
        id="cuisine-filter"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 w-full appearance-none rounded-2xl border border-amber-200/80 bg-white px-4 pr-11 text-sm font-medium text-stone-700 shadow-sm outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
      >
        <option value="">All Cuisines</option>
        {CUISINES.map((cuisine) => (
          <option key={cuisine} value={cuisine.toLowerCase()}>
            {cuisine}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-stone-500">
        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          className="size-4"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.22 7.22a.75.75 0 011.06 0L10 10.94l3.72-3.72a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.22 8.28a.75.75 0 010-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </span>
    </div>
  );
}

export default FilterCuisine;
