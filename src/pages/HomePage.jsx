import { useState } from 'react';
import SearchBar from '../components/SearchBar';
import FilterCuisine from '../components/FilterCuisine';
import RecipeCard from '../components/RecipeCard';
import Pagination from '../components/Pagination';
import { searchRecipes, findRecipesByIngredients } from '../services/api';
import { getApiErrorMessage } from '../utils/apiError';

const DEFAULT_PAGE_SIZE = 5;
const FRIDGE_RESULT_LIMIT = 24;

const parseIngredientInput = (value) =>
  Array.from(
    new Set(
      value
        .split(/[\n,;]+/)
        .map((ingredient) => ingredient.trim().toLowerCase())
        .filter(Boolean)
    )
  );

const getMissingIngredientCount = (recipe) =>
  Number.isFinite(recipe?.missedIngredientCount)
    ? recipe.missedIngredientCount
    : Number.MAX_SAFE_INTEGER;

const sortFridgeResultsByMissingIngredients = (recipes) =>
  [...recipes].sort((firstRecipe, secondRecipe) => {
    const missingDiff =
      getMissingIngredientCount(firstRecipe) -
      getMissingIngredientCount(secondRecipe);

    if (missingDiff !== 0) {
      return missingDiff;
    }

    return (firstRecipe?.title || '').localeCompare(secondRecipe?.title || '');
  });

function HomePage() {
  const [query, setQuery] = useState('');
  const [ingredientsInput, setIngredientsInput] = useState('');
  const [isFridgeMode, setIsFridgeMode] = useState(false);
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
   * @param {Object} options - Search options
   */
  const handleSearch = async (
    {
      submittedQuery = query,
      selectedCuisine = cuisine,
      submittedIngredients = ingredientsInput,
      nextOffset = 0,
      fridgeMode = isFridgeMode,
    } = {}
  ) => {
    const term = submittedQuery.trim();
    const parsedIngredients = parseIngredientInput(submittedIngredients);

    // If Fridge Mode is enabled, ingredients are required
    if (fridgeMode && parsedIngredients.length === 0) {
      setError('Add at least one ingredient for Fridge Mode.');
      setResults([]);
      setOffset(0);
      setTotalResults(0);
      setPageSize(DEFAULT_PAGE_SIZE);
      setHasSearched(true);
      return;
    }

    // If no query and no cuisine, reset results and return
    if (!fridgeMode && !term && !selectedCuisine) {
      setResults([]);
      setError('');
      setHasSearched(false);
      setOffset(0);
      setTotalResults(0);
      setPageSize(DEFAULT_PAGE_SIZE);
      return;
    }

    // Set loading state and clear error
    setIsLoading(true);
    setError('');

    // Search recipes
    try {
      if (fridgeMode) {
        const data = await findRecipesByIngredients(
          parsedIngredients.join(','),
          FRIDGE_RESULT_LIMIT
        );
        const nextResults = sortFridgeResultsByMissingIngredients(
          Array.isArray(data) ? data : []
        );

        setResults(nextResults);
        setOffset(0);
        setTotalResults(nextResults.length);
        setPageSize(DEFAULT_PAGE_SIZE);
      } else {
        const data = await searchRecipes(term, selectedCuisine, nextOffset);
        const nextResults = Array.isArray(data?.results) ? data.results : [];
        const nextPageSize =
          Number.isInteger(data?.number) && data.number > 0
            ? data.number
            : DEFAULT_PAGE_SIZE;

        setResults(nextResults);
        setOffset(nextOffset);
        setTotalResults(
          Number.isInteger(data?.totalResults)
            ? data.totalResults
            : nextResults.length
        );
        setPageSize(nextPageSize);
      }

      setQuery(term);
      setCuisine(selectedCuisine);
      setIngredientsInput(submittedIngredients);
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          'Erreur pendant la recherche. Verifie la cle API.'
        )
      );
      setResults([]);
      setTotalResults(0);
    } finally {
      setHasSearched(true);
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = () => {
    handleSearch({
      submittedQuery: query,
      selectedCuisine: cuisine,
      submittedIngredients: ingredientsInput,
      nextOffset: 0,
      fridgeMode: isFridgeMode,
    });
  };

  /**
   * Handle cuisine filter change
   * @param {string} selectedCuisine - Selected cuisine
   */
  const handleCuisineChange = (selectedCuisine) => {
    setCuisine(selectedCuisine);

    if (!isFridgeMode) {
      handleSearch({
        submittedQuery: query,
        selectedCuisine,
        submittedIngredients: ingredientsInput,
        nextOffset: 0,
        fridgeMode: false,
      });
    }
  };

  const handleFridgeModeChange = (enabled) => {
    setIsFridgeMode(enabled);
    setError('');
    setResults([]);
    setHasSearched(false);
    setOffset(0);
    setTotalResults(0);
    setPageSize(DEFAULT_PAGE_SIZE);

    if (enabled) {
      setCuisine('');
    }
  };

  /**
   * Handle page change
   * @param {number} nextOffset - Pagination offset
   */
  const handlePageChange = (nextOffset) => {
    handleSearch({
      submittedQuery: query,
      selectedCuisine: cuisine,
      submittedIngredients: ingredientsInput,
      nextOffset,
      fridgeMode: false,
    });
  };

  const handleResetFilters = () => {
    setQuery('');
    setIngredientsInput('');
    setIsFridgeMode(false);
    setCuisine('');
    setResults([]);
    setError('');
    setHasSearched(false);
    setOffset(0);
    setTotalResults(0);
    setPageSize(DEFAULT_PAGE_SIZE);
  };

  const readyToCookCount = results.filter(
    (recipe) => recipe.missedIngredientCount === 0
  ).length;
  const resultCountLabel = isFridgeMode
    ? `${readyToCookCount} ready to cook | ${totalResults} matches`
    : totalResults === 1
      ? '1 recipe found'
      : `${totalResults} recipes found`;
  const shouldShowResetButton =
    query.trim().length > 0 ||
    cuisine !== '' ||
    ingredientsInput.trim().length > 0 ||
    isFridgeMode;

  return (
    <div className="bg-warm-radial-home min-h-screen pb-16">
      <main className="mx-auto w-full max-w-6xl px-4 pt-10 sm:px-6 lg:px-8 lg:pt-14">
        <header className="mx-auto max-w-3xl text-center">
          <p className="inline-flex items-center rounded-full border border-amber-200 bg-white/80 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-800 shadow-sm">
            Kitchen journal
          </p>
          <h1 className="mt-5 font-display text-4xl leading-tight tracking-tight text-stone-900 sm:text-5xl lg:text-6xl">
            Find delicious recipes for everyday cooking
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-stone-600 sm:text-base">
            Search by dish name, ingredient, or cuisine to discover your next
            meal.
          </p>
        </header>

        <section className="mt-10 rounded-3xl border border-white/80 bg-white/85 p-4 shadow-[0_20px_45px_-28px_rgba(41,37,36,0.45)] backdrop-blur sm:p-6 relative">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
            <SearchBar
              value={query}
              onChange={setQuery}
              onSubmit={handleSearchSubmit}
              isFridgeMode={isFridgeMode}
              onFridgeModeChange={handleFridgeModeChange}
              ingredientsValue={ingredientsInput}
              onIngredientsChange={setIngredientsInput}
            />
            <FilterCuisine
              value={cuisine}
              onChange={handleCuisineChange}
              disabled={isFridgeMode}
            />
          </div>
          
          {/* Reset button - absolute position on desktop, full width on mobile */}
          {shouldShowResetButton && (
            <button
              type="button"
              onClick={handleResetFilters}
              aria-label="Reset search and filter"
              title="Reset search and filter"
              disabled={isLoading}
              className="cursor-pointer lg:absolute lg:bottom-4 lg:right-4 lg:h-10 lg:w-10 mt-3 lg:mt-0 inline-flex h-12 w-full items-center justify-center rounded-full lg:rounded-full border border-stone-300 bg-white px-5 lg:px-2 text-sm font-semibold text-stone-700 shadow-md transition hover:bg-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="size-4 lg:size-4"
                aria-hidden="true"
              >
                <path
                  d="M4 4v5h5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M20 20v-5h-5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M20 9a8 8 0 0 0-13.66-5L4 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M4 15a8 8 0 0 0 13.66 5L20 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="ml-2 lg:hidden">Reset</span>
              <span className="sr-only lg:sr-only">Reset</span>
            </button>
          )}
        </section>

        {/* Loading and error states */}
        {isLoading && (
          <div className="mt-10 rounded-3xl border border-amber-200 bg-amber-50/80 p-8 text-center shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
              Loading
            </p>
            <p className="mt-2 text-lg font-semibold text-stone-800">
              Finding delicious matches for you...
            </p>
          </div>
        )}

        {!isLoading && error && (
          <div className="mt-10 rounded-3xl border border-red-200 bg-red-50 p-6 text-center text-red-700 shadow-sm">
            {error}
          </div>
        )}

        {!isLoading && !error && !hasSearched && (
          <div className="mt-10 rounded-3xl border border-stone-200 bg-white/90 p-8 text-center shadow-sm">
            <p className="font-display text-2xl text-stone-900">
              Start with a search above
            </p>
            <p className="mt-2 text-sm text-stone-600">
              Try keywords like pasta, soup, tacos, or enable Fridge Mode with
              ingredients like tomato, rice, chicken.
            </p>
          </div>
        )}

        {/* No results */}
        {!isLoading && !error && hasSearched && results.length === 0 && (
          <div className="mt-10 rounded-3xl border border-stone-200 bg-white/90 p-8 text-center shadow-sm">
            <p className="font-display text-2xl text-stone-900">
              No recipes found
            </p>
            <p className="mt-2 text-sm text-stone-600">
              {isFridgeMode
                ? 'Try adding more ingredients or removing uncommon ones.'
                : 'Try a different keyword or remove the cuisine filter.'}
            </p>
          </div>
        )}

        {/* Results */}
        {!isLoading && !error && results.length > 0 && (
          <section className="mt-10">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <h2 className="font-display text-3xl tracking-tight text-stone-900">
                Search results
              </h2>
              <p className="text-sm font-medium text-stone-600">
                {resultCountLabel}
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
              {results.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  isFridgeMode={isFridgeMode}
                />
              ))}
            </div>

            {!isFridgeMode && (
              <Pagination
                totalResults={totalResults}
                offset={offset}
                pageSize={pageSize}
                onPageChange={handlePageChange}
                isDisabled={isLoading}
              />
            )}
          </section>
        )}
      </main>
    </div>
  );
}

export default HomePage;
