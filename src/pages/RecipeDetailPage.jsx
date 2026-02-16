// src/pages/RecipeDetailPage.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getRecipeDetails } from '../services/api';

const SPOONACULAR_IMAGE_SIZES = ['636x393', '556x370', '480x360', '312x231'];

const getRecipeImageCandidates = (recipe) => {
  if (!recipe) {
    return [];
  }

  const imageType = recipe.imageType || 'jpg';
  const fallbackUrls = SPOONACULAR_IMAGE_SIZES.flatMap((size) => [
    `https://img.spoonacular.com/recipes/${recipe.id}-${size}.${imageType}`,
    `https://spoonacular.com/recipeImages/${recipe.id}-${size}.${imageType}`,
  ]);

  return Array.from(new Set([recipe.image, ...fallbackUrls].filter(Boolean)));
};

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

function RecipeDetailPage() {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageIndex, setImageIndex] = useState(0);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const data = await getRecipeDetails(id);
        setRecipe(data);
      } catch (err) {
        setError('Failed to load recipe details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id]);

  useEffect(() => {
    setImageIndex(0);
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
  const hasQuickFacts =
    (Number.isFinite(recipe.readyInMinutes) && recipe.readyInMinutes > 0) ||
    (Number.isFinite(recipe.servings) && recipe.servings > 0) ||
    (Number.isFinite(recipe.healthScore) && recipe.healthScore > 0);

  const handleImageError = () => {
    setImageIndex((current) =>
      current + 1 < imageCandidates.length ? current + 1 : imageCandidates.length
    );
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
              {recipe.extendedIngredients?.map((ingredient, index) => (
                <li
                  key={`${ingredient.id ?? ingredient.name}-${index}`}
                  className="rounded-2xl border border-stone-200 bg-stone-50/80 px-4 py-3 text-stone-700"
                >
                  <span className="font-semibold text-stone-900">
                    {ingredient.amount} {ingredient.unit}
                  </span>{' '}
                  {ingredient.name}
                </li>
              ))}
            </ul>
          </section>

          {/* Instructions */}
          <section className="rounded-3xl border border-stone-200 bg-white/90 p-6 shadow-sm lg:col-span-2">
            <h2 className="font-display text-2xl tracking-tight text-stone-900">
              Cooking Instructions
            </h2>

            {instructions ? (
              <div
                className="mt-4 text-sm leading-7 text-stone-700 [&_a]:font-medium [&_a]:text-amber-700 [&_a:hover]:text-amber-800 [&_li]:ml-5 [&_li]:list-disc [&_ol]:space-y-3 [&_ol]:pl-5 [&_p]:mb-3 [&_ul]:space-y-2 [&_ul]:pl-5"
                dangerouslySetInnerHTML={{ __html: instructions }}
              />
            ) : instructionSteps.length > 0 ? (
              <ol className="mt-4 space-y-3 pl-5 text-sm leading-7 text-stone-700">
                {instructionSteps.map((step) => (
                  <li key={step.number} className="list-decimal">
                    {step.step}
                  </li>
                ))}
              </ol>
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
