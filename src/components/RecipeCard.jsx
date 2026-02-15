function RecipeCard({ recipe }) {
  return (
    <div className="recipe-card">
      <h3>{recipe.title}</h3>
      {recipe.image && (
        <img src={recipe.image} alt={recipe.title} width="200" />
      )}
    </div>
  );
}

export default RecipeCard;