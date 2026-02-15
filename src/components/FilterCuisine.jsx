import { CUISINES } from '../constants/cuisines';

function FilterCuisine({ value, onChange }) {
  return (
    <select 
      value={value} 
      onChange={(e) => onChange(e.target.value)}
      className="filter-cuisine"
    >
      <option value="">All Cuisines</option>
      {CUISINES.map((cuisine) => (
        <option 
          key={cuisine} 
          value={cuisine.toLowerCase()}
        >
          {cuisine}
        </option>
      ))}
    </select>
  );
}

export default FilterCuisine;