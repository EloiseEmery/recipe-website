import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import FilterCuisine from '../components/FilterCuisine';
import RecipeCard from '../components/RecipeCard';
import Pagination from '../components/Pagination';
import { searchRecipes, findRecipesByIngredients } from '../services/api';
import { getApiErrorMessage } from '../utils/apiError';

const DEFAULT_PAGE_SIZE = 5;
const INGREDIENTS_RESULT_LIMIT = 10;
const MIN_LOADING_DURATION_MS = 260;
const SKELETON_CARD_COUNT = 5;

/**
 * Parse ingredient input
 * @param {string} value - Ingredient input value
 * @returns {Array} - Array of unique ingredients
 */
const parseIngredientInput = (value) =>
  Array.from(
    new Set(
      value
        .split(/[\n,;]+/)
        .map((ingredient) => ingredient.trim().toLowerCase())
        .filter(Boolean)
    )
  );

/**
 * Get missing ingredient count
 * @param {Object} recipe - Recipe object
 * @returns {number} - Missing ingredient count
 */
const getMissingIngredientCount = (recipe) =>
  Number.isFinite(recipe?.missedIngredientCount)
    ? recipe.missedIngredientCount
    : Number.MAX_SAFE_INTEGER;

/**
 * Sort recipes by missing ingredients count
 * @param {Array} recipes - Array of recipes
 * @returns {Array} - Sorted array of recipes
 */
const sortIngredientsResultsByMissingIngredients = (recipes) =>
  [...recipes].sort((firstRecipe, secondRecipe) => {
    const missingDiff =
      getMissingIngredientCount(firstRecipe) -
      getMissingIngredientCount(secondRecipe);

    if (missingDiff !== 0) {
      return missingDiff;
    }

    return (firstRecipe?.title || '').localeCompare(secondRecipe?.title || '');
  });

const getInitialSearchState = (locationState) => {
  const searchState = locationState?.searchState;
  const initialResults = Array.isArray(searchState?.results)
    ? searchState.results
    : [];

  return {
    query: typeof searchState?.query === 'string' ? searchState.query : '',
    ingredientsInput:
      typeof searchState?.ingredientsInput === 'string'
        ? searchState.ingredientsInput
        : '',
    isIngredientsMode: Boolean(searchState?.isIngredientsMode),
    results: initialResults,
    hasSearched: Boolean(searchState?.hasSearched),
    cuisine: typeof searchState?.cuisine === 'string' ? searchState.cuisine : '',
    offset:
      Number.isInteger(searchState?.offset) && searchState.offset >= 0
        ? searchState.offset
        : 0,
    totalResults:
      Number.isInteger(searchState?.totalResults) && searchState.totalResults >= 0
        ? searchState.totalResults
        : initialResults.length,
    pageSize:
      Number.isInteger(searchState?.pageSize) && searchState.pageSize > 0
        ? searchState.pageSize
        : DEFAULT_PAGE_SIZE,
  };
};

function HomePage() {
  const location = useLocation();
  const initialSearchState = getInitialSearchState(location.state);

  const [query, setQuery] = useState(initialSearchState.query);
  const [ingredientsInput, setIngredientsInput] = useState(
    initialSearchState.ingredientsInput
  );
  const [isIngredientsMode, setIsIngredientsMode] = useState(
    initialSearchState.isIngredientsMode
  );
  const [results, setResults] = useState(initialSearchState.results);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(initialSearchState.hasSearched);
  const [cuisine, setCuisine] = useState(initialSearchState.cuisine);
  const [offset, setOffset] = useState(initialSearchState.offset);
  const [totalResults, setTotalResults] = useState(initialSearchState.totalResults);
  const [pageSize, setPageSize] = useState(initialSearchState.pageSize);
  const [resultsTransitionKey, setResultsTransitionKey] = useState(0);
  const [activeSearchLabel, setActiveSearchLabel] = useState('recipes');
  const [isPageChangeLoading, setIsPageChangeLoading] = useState(false);

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
      IngredientsMode = isIngredientsMode,
      allowEmptySearch = false,
      showSearchButtonLoading = true,
    } = {}
  ) => {
    const term = submittedQuery.trim();
    const parsedIngredients = parseIngredientInput(submittedIngredients);

    // If Ingredients Mode is enabled, ingredients are required
    if (IngredientsMode && parsedIngredients.length === 0) {
      setError('Add at least one ingredient for Ingredients Mode.');
      setResults([]);
      setOffset(0);
      setTotalResults(0);
      setPageSize(DEFAULT_PAGE_SIZE);
      setHasSearched(true);
      return;
    }

    // If no query and no cuisine, reset results and return
    if (!IngredientsMode && !term && !selectedCuisine && !allowEmptySearch) {
      setResults([]);
      setError('');
      setHasSearched(false);
      setOffset(0);
      setTotalResults(0);
      setPageSize(DEFAULT_PAGE_SIZE);
      return;
    }

    // Set loading state and clear error
    const startedAt = Date.now();
    const loadingLabel = IngredientsMode
      ? parsedIngredients.slice(0, 3).join(', ') || 'your ingredients'
      : term || selectedCuisine || 'recipes';

    setIsLoading(true);
    setIsPageChangeLoading(!showSearchButtonLoading);
    setError('');
    setActiveSearchLabel(loadingLabel);

    // Search recipes
    try {
      if (IngredientsMode) {
        const data = await findRecipesByIngredients(
          parsedIngredients.join(','),
          INGREDIENTS_RESULT_LIMIT
        );
        const nextResults = sortIngredientsResultsByMissingIngredients(
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
      const elapsed = Date.now() - startedAt;

      if (elapsed < MIN_LOADING_DURATION_MS) {
        await new Promise((resolve) => {
          setTimeout(resolve, MIN_LOADING_DURATION_MS - elapsed);
        });
      }

      setHasSearched(true);
      setIsLoading(false);
      setIsPageChangeLoading(false);
      setResultsTransitionKey((currentKey) => currentKey + 1);
    }
  };

  const handleSearchSubmit = () => {
    handleSearch({
      submittedQuery: query,
      selectedCuisine: cuisine,
      submittedIngredients: ingredientsInput,
      nextOffset: 0,
      IngredientsMode: isIngredientsMode,
      allowEmptySearch: !isIngredientsMode,
    });
  };

  /**
   * Handle cuisine filter change
   * @param {string} selectedCuisine - Selected cuisine
   */
  const handleCuisineChange = (selectedCuisine) => {
    setCuisine(selectedCuisine);

    if (!isIngredientsMode) {
      handleSearch({
        submittedQuery: query,
        selectedCuisine,
        submittedIngredients: ingredientsInput,
        nextOffset: 0,
        IngredientsMode: false,
      });
    }
  };

  const handleIngredientsModeChange = (enabled) => {
    setIsIngredientsMode(enabled);
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
      IngredientsMode: false,
      allowEmptySearch: true,
      showSearchButtonLoading: false,
    });
  };

  const handleResetFilters = () => {
    setQuery('');
    setIngredientsInput('');
    setIsIngredientsMode(false);
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
  const resultCountLabel = isIngredientsMode
    ? `${readyToCookCount} ready to cook | ${totalResults} matches`
    : totalResults === 1
      ? '1 recipe found'
      : `${totalResults} recipes found`;
  const searchStateSnapshot = {
    query,
    ingredientsInput,
    isIngredientsMode,
    results,
    hasSearched,
    cuisine,
    offset,
    totalResults,
    pageSize,
  };
  const shouldShowResetButton =
    hasSearched ||
    query.trim().length > 0 ||
    cuisine !== '' ||
    ingredientsInput.trim().length > 0 ||
    isIngredientsMode;
  const isSearchControlLoading = isLoading && !isPageChangeLoading;

  return (
    <div className="bg-warm-radial-home min-h-screen pb-16">
      <main className="mx-auto w-full max-w-6xl px-4 pt-10 sm:px-6 lg:px-8 lg:pt-14">
        <header className="mx-auto max-w-3xl text-center">
          <h1 className="mt-5 font-display text-4xl leading-tight tracking-tight text-stone-900 sm:text-5xl lg:text-6xl">
            Find delicious recipes for everyday cooking
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-stone-600 sm:text-base">
            Search by recipe name, cuisine, or ingredient to discover your next
            meal.
          </p>
        </header>

        <section
          className={`mt-10 rounded-3xl border border-white/80 bg-white/85 p-4 shadow-[0_20px_45px_-28px_rgba(41,37,36,0.45)] backdrop-blur sm:p-6 relative transition-opacity duration-300 ${
            isSearchControlLoading ? 'search-panel-loading' : ''
          }`}
        >
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
            {!isIngredientsMode && (
              <div className="hidden lg:block lg:order-2">
                <FilterCuisine
                  id="cuisine-filter-desktop"
                  value={cuisine}
                  onChange={handleCuisineChange}
                  disabled={isIngredientsMode || isSearchControlLoading}
                />
              </div>
            )}
            <div className="order-1 lg:order-1 lg:flex-1">
              <SearchBar
                value={query}
                onChange={setQuery}
                onSubmit={handleSearchSubmit}
                isIngredientsMode={isIngredientsMode}
                onIngredientsModeChange={handleIngredientsModeChange}
                ingredientsValue={ingredientsInput}
                onIngredientsChange={setIngredientsInput}
                isLoading={isSearchControlLoading}
                isButtonLoading={isSearchControlLoading}
                mobileCuisineFilter={
                  !isIngredientsMode ? (
                    <div className="lg:hidden w-full">
                      <FilterCuisine
                        id="cuisine-filter-mobile"
                        value={cuisine}
                        onChange={handleCuisineChange}
                        disabled={isIngredientsMode || isSearchControlLoading}
                      />
                    </div>
                  ) : null
                }
              />
            </div>
          </div>
          
          {/* Reset button - absolute position on desktop, full width on mobile */}
          {shouldShowResetButton && (
            <button
              type="button"
              onClick={handleResetFilters}
              aria-label="Reset search and filter"
              title="Reset search and filter"
              disabled={isSearchControlLoading}
              className="cursor-pointer lg:absolute lg:bottom-4 lg:right-4 lg:h-10 lg:w-auto mt-3 lg:mt-0 inline-flex h-12 w-full items-center justify-center rounded-full border border-stone-300 bg-white px-5 lg:px-4 text-sm font-semibold text-stone-700 shadow-md transition hover:bg-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="size-4 lg:size-4"
                aria-hidden="true"
              >
                <path
                  d="M19 12H5m0 0 5-5m-5 5 5 5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            
              <span className="ml-2">Clear search</span>
            </button>
          )}
        </section>

        {/* Loading and error states */}
        {isLoading && (
          <section
            aria-live="polite"
            className="mt-10 animate-fade-rise rounded-3xl border border-amber-200/80 bg-white/92 p-6 shadow-sm sm:p-8"
          >
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
                  Searching
                </p>
                <p className="mt-2 text-lg font-semibold text-stone-800">
                  Finding delicious matches for "{activeSearchLabel}"...
                </p>
              </div>
              <span className="inline-flex size-9 items-center justify-center rounded-full bg-amber-100 text-amber-700 animate-soft-pulse">
                <span className="size-3 rounded-full bg-amber-500" />
              </span>
            </div>

            <div className="grid gap-5 xxs:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
              {Array.from({ length: SKELETON_CARD_COUNT }).map(
                (_, skeletonIndex) => (
                  <article
                    key={`skeleton-${skeletonIndex}`}
                    className="animate-card-rise overflow-hidden rounded-3xl border border-stone-200/90 bg-white p-4 shadow-sm"
                    style={{ animationDelay: `${skeletonIndex * 70}ms` }}
                  >
                    <div className="skeleton-shimmer aspect-4xl rounded-2xl" />
                    <div className="mt-4 space-y-2">
                      <div className="skeleton-shimmer h-3 rounded-full" />
                      <div className="skeleton-shimmer h-3 w-4/5 rounded-full" />
                      <div className="mt-3 flex gap-2">
                        <div className="skeleton-shimmer h-6 w-20 rounded-full" />
                        <div className="skeleton-shimmer h-6 w-16 rounded-full" />
                      </div>
                    </div>
                  </article>
                )
              )}
            </div>
          </section>
        )}

        {!isLoading && error && (
          <div
            key={`error-${resultsTransitionKey}-${error}`}
            className="mt-10 animate-fade-rise rounded-3xl border border-red-200 bg-red-50 p-6 text-center text-red-700 shadow-sm"
          >
            {error}
          </div>
        )}

        {!isLoading && !error && !hasSearched && (
          <div className="mt-10 animate-fade-rise rounded-3xl border border-stone-200/90 bg-white/95 p-6 shadow-sm sm:p-8">
            <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
              Quick guide
            </p>
            <p className="mt-2 text-center font-display text-2xl text-stone-900">
              Choose how you want to search
            </p>

            <div className="mx-auto mt-6 grid max-w-3xl gap-3 text-left md:grid-cols-2">
              <article className="rounded-2xl border border-stone-200 bg-stone-50/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                  Search by keyword or cuisine
                </p>
                <p className="mt-2 text-sm leading-relaxed text-stone-700">
                  Type a dish, ingredient, or cuisine to explore matching
                  recipes quickly. You can also use the cuisine filter to
                  narrow down your search.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {['pasta', 'soup', 'tacos'].map((keyword) => (
                    <span
                      key={keyword}
                      className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </article>

              <article className="rounded-2xl border border-stone-200 bg-stone-50/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                  Search by ingredients
                </p>
                <p className="mt-2 text-sm leading-relaxed text-stone-700">
                  Enable Search by ingredients, then list what you already
                  have. You will see recipes you can cook now and recipes with
                  only a few missing items.
                </p>
                <p className="mt-3 text-xs font-medium text-stone-500">
                  Example: tomato, herbs, anchovy
                </p>
              </article>
            </div>
          </div>
        )}

        {/* No results */}
        {!isLoading && !error && hasSearched && results.length === 0 && (
          <div
            key={`no-results-${resultsTransitionKey}`}
            className="mt-10 animate-fade-rise rounded-3xl border border-stone-200 bg-white/90 p-8 text-center shadow-sm"
          >
            <p className="font-display text-2xl text-stone-900">
              No recipes found
            </p>
            <p className="mt-2 text-sm text-stone-600">
              {isIngredientsMode
                ? 'Try adding more ingredients or removing uncommon ones.'
                : 'Try a different keyword or remove the cuisine filter.'}
            </p>
          </div>
        )}

        {/* Results */}
        {!isLoading && !error && results.length > 0 && (
          <section
            key={`results-${resultsTransitionKey}-${offset}`}
            className="mt-10 animate-fade-rise"
          >
            <div
              className={`mb-10 items-center gap-3 ${
                isIngredientsMode
                  ? 'lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-6'
                  : 'sm:flex sm:items-center sm:justify-between sm:gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-center lg:gap-6'
              }`}
            >
              {isIngredientsMode ? (
                <>
                  <h2 className="font-display pb-2 text-3xl tracking-tight text-stone-900 lg:justify-self-start">
                    Search results
                  </h2>
                  <p className="text-sm font-medium text-stone-600 lg:justify-self-end lg:text-right">
                    {resultCountLabel}
                  </p>
                </>
              ) : (
                <>
                  <div className="sm:flex-1 lg:justify-self-start">
                    <h2 className="font-display text-3xl tracking-tight text-stone-900">
                      Search results
                    </h2>
                    <p className="pt-1 text-sm font-medium text-stone-600 lg:hidden">
                      {resultCountLabel}
                    </p>
                  </div>

                  <div className="hidden sm:flex sm:shrink-0 lg:hidden">
                    <Pagination
                      totalResults={totalResults}
                      offset={offset}
                      pageSize={pageSize}
                      onPageChange={handlePageChange}
                      isDisabled={isLoading}
                    />
                  </div>

                  <div className="hidden lg:flex lg:justify-center">
                    <Pagination
                      totalResults={totalResults}
                      offset={offset}
                      pageSize={pageSize}
                      onPageChange={handlePageChange}
                      isDisabled={isLoading}
                    />
                  </div>

                  <p className="hidden text-sm font-medium text-stone-600 lg:block lg:justify-self-end lg:text-right">
                    {resultCountLabel}
                  </p>
                </>
              )}
            </div>

            <div className="grid gap-5 xxs:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
              {results.map((recipe, recipeIndex) => (
                <div
                  key={recipe.id}
                  className="animate-card-rise h-full"
                  style={{ animationDelay: `${Math.min(recipeIndex * 75, 420)}ms` }}
                >
                  <RecipeCard
                    recipe={recipe}
                    isIngredientsMode={isIngredientsMode}
                    searchState={searchStateSnapshot}
                  />
                </div>
              ))}
            </div>

            {!isIngredientsMode && (
              <div className="mt-6 sm:hidden">
                <Pagination
                  totalResults={totalResults}
                  offset={offset}
                  pageSize={pageSize}
                  onPageChange={handlePageChange}
                  isDisabled={isLoading}
                />
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

export default HomePage;
