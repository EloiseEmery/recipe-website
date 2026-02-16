import axios from 'axios';

/* Define the API key and base URL */
const API_KEY = import.meta.env.VITE_SPOONACULAR_API_KEY;
const BASE_URL = 'https://api.spoonacular.com';

/**
 * Search for recipes
 * @param {string} query - Search term
 * @param {string} cuisine - Cuisine type
 * @param {number} [offset=0] - Pagination offset
 */
export const searchRecipes = async (query, cuisine, offset = 0) => {
  const response = await axios.get(`${BASE_URL}/recipes/complexSearch`, {
    params: {
      apiKey: API_KEY,
      query,
      cuisine,
      number: 5,
      offset,
      addRecipeInformation: true
    }
  });
  return response.data;
};

/**
 * Find recipes by a list of available ingredients
 * @param {string} ingredients - Comma-separated ingredient list
 * @param {number} [limit=24] - Max number of recipes to return
 */
export const findRecipesByIngredients = async (ingredients, limit = 24) => {
  const response = await axios.get(`${BASE_URL}/recipes/findByIngredients`, {
    params: {
      apiKey: API_KEY,
      ingredients,
      number: limit,
      ranking: 1,
      ignorePantry: true,
    },
  });

  return response.data;
};

/**
 * Get recipe details 
 * @param {number} id - Recipe ID
 */
export const getRecipeDetails = async (id) => {
  const response = await axios.get(`${BASE_URL}/recipes/${id}/information`, {
    params: {
      apiKey: API_KEY,
      includeNutrition: false
    }
  });
  return response.data;
};
