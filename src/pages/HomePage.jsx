import { useState } from 'react';
import SearchBar from '../components/SearchBar';
import FilterCuisine from '../components/FilterCuisine';
import RecipeCard from '../components/RecipeCard';
import Pagination from '../components/Pagination';
import { searchRecipes } from '../services/api';

const DEFAULT_PAGE_SIZE = 5;

function HomePage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [cuisine, setCuisine] = useState('');
  const [offset, setOffset] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  /**
   * Handle search submission
   * @param {string} submittedQuery - Search term
   * @param {string} selectedCuisine - Cuisine filter
   * @param {number} nextOffset - Pagination offset
   */
  const handleSearch = async (
    submittedQuery = query,
    selectedCuisine = cuisine,
    nextOffset = 0
  ) => {
    const term = submittedQuery.trim();

    // If no query and no cuisine, reset results and return
    if (!term && !selectedCuisine) {
      setResults([]);
      setError('');
      setHasSearched(false);
      setOffset(0);
      setTotalResults(0);
      return;
    }

    // Set loading state and clear error
    setIsLoading(true);
    setError('');

    // Search recipes
    try {
      const data = await searchRecipes(term, selectedCuisine, nextOffset);
      const nextResults = Array.isArray(data?.results) ? data.results : [];
      const nextPageSize =
        Number.isInteger(data?.number) && data.number > 0
          ? data.number
          : DEFAULT_PAGE_SIZE;

      setQuery(term);
      setResults(nextResults);
      setOffset(nextOffset);
      setTotalResults(
        Number.isInteger(data?.totalResults) ? data.totalResults : nextResults.length
      );
      setPageSize(nextPageSize);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          'Erreur pendant la recherche. Verifie la cle API.'
      );
      setResults([]);
      setTotalResults(0);
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
    handleSearch(query, selectedCuisine, 0);
  };

  const handlePageChange = (nextOffset) => {
    handleSearch(query, cuisine, nextOffset);
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
        <div>
          <div className="">
            {results.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
          <Pagination
            totalResults={totalResults}
            offset={offset}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            isDisabled={isLoading}
          />
        </div>
      )}
    </div>
  );
}

export default HomePage;
