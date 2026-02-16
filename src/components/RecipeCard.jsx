import { Link } from 'react-router-dom';

function RecipeCard({ recipe }) {
  return (
    <Link to={`/recipe/${recipe.id}`} className="">
      <img 
        src={recipe.image} 
        alt={recipe.title}
        className=""
      />
      <h3 className="">{recipe.title}</h3>
    </Link>
  );
}

export default RecipeCard;