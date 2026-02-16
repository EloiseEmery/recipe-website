// src/pages/RecipeDetailPage.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getRecipeDetails } from '../services/api';
import { getApiErrorMessage } from '../utils/apiError';

// Possible image sizes from Spoonacular API to solve image loading issues
const SPOONACULAR_IMAGE_SIZES = ['636x393', '556x370', '480x360', '312x231'];

/**
 * Get recipe image candidates
 * @param {Object} recipe - The recipe object
 * @returns {Array} - Array of image candidates
 */
const getRecipeImageCandidates = (recipe) => {
  if (!recipe) {
    return [];
  }

  const imageType = recipe.imageType || 'jpg';
  const fallbackUrls = SPOONACULAR_IMAGE_SIZES.flatMap((size) => [
    `https://img.spoonacular.com/recipes/${recipe.id}-${size}.${imageType}`,
    `https://spoonacular.com/recipeImages/${recipe.id}-${size}.${imageType}`,
  ]);

  // Return cleaned array of unique image candidates
  return Array.from(new Set([recipe.image, ...fallbackUrls].filter(Boolean)));
};

/**
 * Convert HTML to plain text for clean display
 * @param {string} html - The HTML string to convert
 * @returns {string} - The plain text string
 */
const toPlainText = (html) => {
  if (!html) {
    return '';
  }

  if (typeof window === 'undefined') {
    return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  const parsed = new DOMParser().parseFromString(html, 'text/html');
  return parsed.body.textContent?.replace(/\s+/g, ' ').trim() || '';
};

/**
 * Get recipe detail page
 * @returns {JSX.Element} - The recipe detail page
 */
function RecipeDetailPage() {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageIndex, setImageIndex] = useState(0);
  const [checkedIngredients, setCheckedIngredients] = useState({});

  // Fetch recipe details
  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const data = await getRecipeDetails(id);
        setRecipe(data);
      } catch (err) {
        setError(
          getApiErrorMessage(err, 'Impossible de charger les details de la recette.')
        );
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id]);

  // Reset image index and checked ingredients when recipe changes
  useEffect(() => {
    setImageIndex(0);
    setCheckedIngredients({});
  }, [recipe?.id]);

  const summaryText = toPlainText(recipe?.summary);
  const imageCandidates = getRecipeImageCandidates(recipe);
  const currentImageUrl = imageCandidates[imageIndex];

  if (loading) {
    return (
      <div className="bg-warm-radial-detail min-h-screen px-4 pt-10 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-5xl rounded-3xl border border-amber-200 bg-amber-50/80 p-8 text-center shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
            Loading
          </p>
          <p className="mt-2 text-lg font-semibold text-stone-800">
            Loading recipe details...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-warm-radial-detail min-h-screen px-4 pt-10 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-5xl rounded-3xl border border-red-200 bg-red-50 p-8 text-center shadow-sm">
          <p className="font-semibold text-red-700">{error}</p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
          >
            Back to search
          </Link>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="bg-warm-radial-detail min-h-screen px-4 pt-10 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-5xl rounded-3xl border border-stone-200 bg-white p-8 text-center shadow-sm">
          <p className="font-semibold text-stone-800">Recipe not found</p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center rounded-xl border border-stone-200 bg-stone-100 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-200"
          >
            Back to search
          </Link>
        </div>
      </div>
    );
  }

  const hasHealthInfo =
    recipe.vegan || recipe.vegetarian || recipe.glutenFree || recipe.dairyFree;
  const instructions = recipe.instructions?.trim();
  const instructionSteps = recipe.analyzedInstructions?.[0]?.steps || [];
  const instructionText =
    toPlainText(instructions) ||
    instructionSteps
      .map((step) => step?.step?.replace(/\s+/g, ' ').trim())
      .filter(Boolean)
      .join(' ');
  const hasQuickFacts =
    (Number.isFinite(recipe.readyInMinutes) && recipe.readyInMinutes > 0) ||
    (Number.isFinite(recipe.servings) && recipe.servings > 0) ||
    (Number.isFinite(recipe.healthScore) && recipe.healthScore > 0);
  const getIngredientKey = (ingredient, index) =>
    `${ingredient.id ?? ingredient.name}-${index}`;

  const handleImageError = () => {
    setImageIndex((current) =>
      current + 1 < imageCandidates.length ? current + 1 : imageCandidates.length
    );
  };

  /**
   * Handle ingredient toggle
   * @param {string} ingredientKey - The ingredient key
   */
  const handleIngredientToggle = (ingredientKey) => {
    setCheckedIngredients((current) => ({
      ...current,
      [ingredientKey]: !current[ingredientKey],
    }));
  };

  return (
    <div className="bg-warm-radial-detail min-h-screen pb-16">
      <main className="mx-auto w-full max-w-6xl px-4 pt-8 sm:px-6 lg:px-8 lg:pt-10">
        <Link
          to="/"
          className="inline-flex items-center rounded-xl border border-stone-200 bg-white/85 px-4 py-2 text-sm font-semibold text-stone-700 shadow-sm transition hover:border-amber-300 hover:text-amber-700"
        >
          Back to search
        </Link>

        <article className="mt-6 rounded-4xl border border-white/80 bg-white/90 shadow-[0_24px_50px_-30px_rgba(41,37,36,0.45)] backdrop-blur">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
            <div className="relative aspect-4/3 overflow-hidden rounded-t-4xl bg-stone-100 lg:h-full lg:aspect-auto lg:rounded-l-4xl lg:rounded-tr-none">
              {currentImageUrl ? (
                <>
                  <img
                    src={currentImageUrl}
                    alt={recipe.title}
                    className="h-full w-full object-cover"
                    onError={handleImageError}
                  />
                  <div className="pointer-events-none absolute inset-0 bg-linear-to-tr from-stone-950/25 to-transparent" />
                </>
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-stone-200 to-stone-300">
                  <span className="text-sm font-semibold text-stone-600">
                    Image unavailable
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-6 p-6 sm:p-8">
              <div>
                <p className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-800">
                  Recipe details
                </p>
                <h1 className="mt-3 font-display text-3xl leading-tight tracking-tight text-stone-900 sm:text-4xl">
                  {recipe.title}
                </h1>
              </div>

              {summaryText && (
                <p className="text-sm leading-7 text-stone-600">{summaryText}</p>
              )}

              {hasQuickFacts && (
                <div className="flex flex-wrap gap-2 text-xs font-semibold">
                  {Number.isFinite(recipe.readyInMinutes) &&
                    recipe.readyInMinutes > 0 && (
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-900">
                        {recipe.readyInMinutes} min
                      </span>
                    )}
                  {Number.isFinite(recipe.servings) && recipe.servings > 0 && (
                    <span className="rounded-full bg-stone-100 px-3 py-1 text-stone-700">
                      {recipe.servings} servings
                    </span>
                  )}
                  {Number.isFinite(recipe.healthScore) &&
                    recipe.healthScore > 0 && (
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-900">
                        Health score {recipe.healthScore}
                      </span>
                    )}
                </div>
              )}
            </div>
          </div>
        </article>

        {/* Health Information */}
        {hasHealthInfo && (
          <section className="mt-6 rounded-3xl border border-stone-200 bg-white/90 p-6 shadow-sm">
            <h2 className="font-display text-2xl tracking-tight text-stone-900">
              Health Information
            </h2>
            <div className="mt-4 flex flex-wrap gap-2 text-sm font-semibold">
              {recipe.vegan && (
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-900">
                  Vegan
                </span>
              )}
              {recipe.vegetarian && (
                <span className="rounded-full bg-lime-100 px-3 py-1 text-lime-900">
                  Vegetarian
                </span>
              )}
              {recipe.glutenFree && (
                <span className="rounded-full bg-sky-100 px-3 py-1 text-sky-900">
                  Gluten Free
                </span>
              )}
              {recipe.dairyFree && (
                <span className="rounded-full bg-indigo-100 px-3 py-1 text-indigo-900">
                  Dairy Free
                </span>
              )}
            </div>
          </section>
        )}

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* Ingredients */}
          <section className="rounded-3xl border border-stone-200 bg-white/90 p-6 shadow-sm">
            <h2 className="font-display text-2xl tracking-tight text-stone-900">
              Ingredients
            </h2>
            <ul className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              {recipe.extendedIngredients?.map((ingredient, index) => {
                const ingredientKey = getIngredientKey(ingredient, index);
                const isChecked = Boolean(checkedIngredients[ingredientKey]);

                return (
                  <li
                    key={ingredientKey}
                    className={`rounded-2xl border px-4 py-3 transition ${
                      isChecked
                        ? 'border-emerald-200 bg-emerald-50/70'
                        : 'border-stone-200 bg-stone-50/80'
                    }`}
                  >
                    <label
                      htmlFor={`ingredient-checkbox-${index}`}
                      className="flex cursor-pointer items-start gap-3"
                    >
                      <input
                        id={`ingredient-checkbox-${index}`}
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleIngredientToggle(ingredientKey)}
                        className="mt-1 h-4 w-4 rounded border-stone-300 text-amber-600 focus:ring-amber-500"
                      />
                      <span
                        className={isChecked ? 'text-stone-500 line-through' : 'text-stone-700'}
                      >
                        <span
                          className={`font-semibold ${
                            isChecked ? 'text-stone-500' : 'text-stone-900'
                          }`}
                        >
                          {ingredient.amount} {ingredient.unit}
                        </span>{' '}
                        {ingredient.name}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* Instructions */}
          <section className="rounded-3xl border border-stone-200 bg-white/90 p-6 shadow-sm lg:col-span-2">
            <h2 className="font-display text-2xl tracking-tight text-stone-900">
              Cooking Instructions
            </h2>

            {instructionText ? (
              <p className="mt-4 text-sm leading-7 text-stone-700">{instructionText}</p>
            ) : (
              <p className="mt-4 text-sm text-stone-600">
                No cooking instructions are available for this recipe.
              </p>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default RecipeDetailPage;
