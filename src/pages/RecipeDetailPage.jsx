// src/pages/RecipeDetailPage.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getRecipeDetails } from '../services/api';

function RecipeDetailPage() {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) return <div className="">Loading recipe...</div>;
  if (error) return <div className="">{error}</div>;
  if (!recipe) return <div>Recipe not found</div>;

  return (
    <div className="">
      <Link to="/" className="">← Back to Search</Link>

      <h1>{recipe.title}</h1>
      
      <img 
        src={recipe.image} 
        alt={recipe.title}
        className=""
      />

      {/* Health Information */}
      <div className="">
        <h2>Health Information</h2>
        <div className="">
          {recipe.vegan && <span className="">Vegan</span>}
          {recipe.vegetarian && <span className="">Vegetarian</span>}
          {recipe.glutenFree && <span className="">Gluten Free</span>}
          {recipe.dairyFree && <span className="">Dairy Free</span>}
        </div>
      </div>

      {/* Ingredients */}
      <div className="">
        <h2>Ingredients</h2>
        <ul className="">
          {recipe.extendedIngredients?.map((ingredient) => (
            <li key={ingredient.id}>
              <strong>{ingredient.amount} {ingredient.unit}</strong> {ingredient.name}
            </li>
          ))}
        </ul>
      </div>

      {/* Instructions */}
      <div className="">
        <h2>Cooking Instructions</h2>
        <div 
          className=""
          dangerouslySetInnerHTML={{ __html: recipe.instructions }}
        />
      </div>
    </div>
  );
}

export default RecipeDetailPage;