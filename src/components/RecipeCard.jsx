import { Link } from 'react-router-dom';

function RecipeCard({ recipe, isFridgeMode = false }) {
  const hasCookTime =
    Number.isFinite(recipe.readyInMinutes) && recipe.readyInMinutes > 0;
  const hasServings = Number.isFinite(recipe.servings) && recipe.servings > 0;
  const hasMissedIngredientCount = Number.isFinite(recipe.missedIngredientCount);
  const hasIngredientMatchData =
    isFridgeMode || hasMissedIngredientCount;
  const isReadyToCook = hasMissedIngredientCount && recipe.missedIngredientCount === 0;
  const missingIngredientNames = Array.isArray(recipe.missedIngredients)
    ? recipe.missedIngredients
        .map((ingredient) => ingredient?.name)
        .filter(Boolean)
    : [];
  const missingIngredientPreview = missingIngredientNames.slice(0, 3);
  const hasMoreMissingIngredients =
    missingIngredientNames.length > missingIngredientPreview.length;
  const hasMetadata =
    hasCookTime ||
    hasServings ||
    recipe.vegetarian ||
    hasIngredientMatchData ||
    Number.isFinite(recipe.likes);

  return (
    <Link
      to={`/recipe/${recipe.id}`}
      className="group block overflow-hidden rounded-3xl border border-stone-200/80 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-200"
    >
      <div className="relative aspect-4xl overflow-hidden bg-stone-100">
        <img
          src={recipe.image}
          alt={recipe.title}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-stone-950/30 to-transparent" />
      </div>

      <div className="space-y-3 p-4 sm:p-5">
        <h3 className="min-h-12 text-lg font-semibold leading-snug tracking-tight text-stone-900 transition group-hover:text-amber-700">
          {recipe.title}
        </h3>

        {hasMetadata && (
          <div className="flex flex-wrap gap-2 text-xs font-medium text-stone-700">
            {hasCookTime && (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-900">
                {recipe.readyInMinutes} min
              </span>
            )}
            {hasServings && (
              <span className="rounded-full bg-stone-100 px-3 py-1 text-stone-700">
                {recipe.servings} servings
              </span>
            )}
            {recipe.vegetarian && (
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-900">
                Vegetarian
              </span>
            )}
            {/* Fridge Mode */}
            {hasMissedIngredientCount &&
              (isReadyToCook ? (
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-900">
                  Ready to cook
                </span>
              ) : (
                <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-900">
                  {recipe.missedIngredientCount} missing ingredients
                </span>
              ))}
            {Number.isFinite(recipe.likes) && (
              <span className="rounded-full bg-stone-100 px-3 py-1 text-stone-700">
                {recipe.likes} likes
              </span>
            )}
          </div>
        )}

        {missingIngredientPreview.length > 0 && (
          <p className="text-sm text-stone-600">
            Missing: {missingIngredientPreview.join(', ')}
            {hasMoreMissingIngredients ? '...' : ''}
          </p>
        )}
      </div>
    </Link>
  );
}

export default RecipeCard;
