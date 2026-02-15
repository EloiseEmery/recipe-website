import { useState } from 'react';
import SearchBar from '../components/SearchBar';
import { searchRecipes } from '../services/api';

function HomePage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  /**
   * Handle search submission
   * @param {string} query - Search term
   */
  const handleSearch = async () => {
    const term = query.trim();

    // If no query, reset results and return
    if (!term) {
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
      const data = await searchRecipes(term, '', 0);
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

  return (
    <div>
      <h1>Home Page</h1>

      <SearchBar value={query} onChange={setQuery} onSubmit={handleSearch} />

      {isLoading && <p>Loading...</p>}
      {!isLoading && error && <p>{error}</p>}

      {!isLoading && !error && hasSearched && results.length === 0 && (
        <p>No recipe found.</p>
      )}

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
