import { useState } from 'react';
import SearchBar from '../components/SearchBar';
import { searchRecipes } from '../services/api';
import FilterCuisine from '../components/FilterCuisine';

function HomePage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [cuisine, setCuisine] = useState('');

  /**
   * Handle search submission
   * @param {string} submittedQuery - Search term
   * @param {string} selectedCuisine - Cuisine filter
   */
  const handleSearch = async (submittedQuery = query, selectedCuisine = cuisine) => {
    const term = submittedQuery.trim();

    // If no query and no cuisine, reset results and return
    if (!term && !selectedCuisine) {
      setResults([]);
      setError('');
      setHasSearched(false);
      return;
    }

    // Set loading state and clear error
    setIsLoading(true);
    setError('');

    // Search recipes
    try {
      const data = await searchRecipes(term, selectedCuisine, 0);
      setResults(Array.isArray(data?.results) ? data.results : []);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          'Erreur pendant la recherche. Verifie la cle API.'
      );
      setResults([]);
    } finally {
      setHasSearched(true);
      setIsLoading(false);
    }
  };

  /**
   * Handle cuisine filter change
   * @param {string} selectedCuisine - Selected cuisine
   */
  const handleCuisineChange = (selectedCuisine) => {
    setCuisine(selectedCuisine);
    handleSearch(query, selectedCuisine);
  };

  return (
    <div>
        <h1>Home Page</h1>
        <div>
            <SearchBar value={query} onChange={setQuery} onSubmit={handleSearch} />
        </div>
        <div>
            <FilterCuisine value={cuisine} onChange={handleCuisineChange} />
        </div>

        {/* Loading and error states */}
        {isLoading && <p>Loading...</p>}
        {!isLoading && error && <p>{error}</p>}
        
        {/* No results */}
        {!isLoading && !error && hasSearched && results.length === 0 && (
            <p>No recipe found.</p>
        )}

        {/* Results */}
        {!isLoading && !error && results.length > 0 && (
            <ul>
            {results.map((recipe) => (
                <li key={recipe.id}>
                <h2>{recipe.title}</h2>
                {recipe.image && (
                    <img src={recipe.image} alt={recipe.title} width="200" />
                )}
                </li>
            ))}
            </ul>
        )}
    </div>
  );
}

export default HomePage;
