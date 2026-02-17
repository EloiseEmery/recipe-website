import axios from 'axios';

/* Define the API key and base URL */
const API_KEY = import.meta.env.VITE_SPOONACULAR_API_KEY;
const BASE_URL = 'https://api.spoonacular.com';
const RECIPES_PAGE_SIZE = 5;

/**
 * Search for recipes
 * @param {string} query - Search term
 * @param {string} cuisine - Cuisine type
 * @param {number} [offset=0] - Pagination offset
 * @returns {Promise<Object>} - Search payload
 */
export const searchRecipes = async (query, cuisine, offset = 0) => {
  const response = await axios.get(`${BASE_URL}/recipes/complexSearch`, {
    params: {
      apiKey: API_KEY,
      query,
      cuisine,
      number: RECIPES_PAGE_SIZE,
      offset,
      addRecipeInformation: true,
    },
  });

  return response.data;
};

/**
 * Find recipes by a list of available ingredients
 * @param {string} ingredients - Comma-separated ingredient list
 * @param {number} [limit=10] - Max number of recipes to return
 * @returns {Promise<Array>} - Ingredient-based recipes
 */
export const findRecipesByIngredients = async (ingredients, limit = 10) => {
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
 * @param {number|string} id - Recipe ID
 * @returns {Promise<Object>} - Recipe details payload
 */
export const getRecipeDetails = async (id) => {
  const response = await axios.get(`${BASE_URL}/recipes/${id}/information`, {
    params: {
      apiKey: API_KEY,
      includeNutrition: false,
    },
  });

  return response.data;
};
