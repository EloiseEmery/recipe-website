# Recipe website

A responsive React + Vite application that helps users discover meals faster with Spoonacular data. Users can search by keyword or by ingredients they already have, refine results by cuisine, browse paginated matches, and open detailed recipe pages with ingredients and cooking instructions.

## Main Features

- Keyword search with paginated results
- Cuisine filtering
- Ingredient-based search mode (with missing ingredient insights)
- Recipe detail page (summary, ingredients checklist, cooking instructions)
- Loading, empty, and error states with user-friendly API error messages

## Tech Stack

- React 19
- React Router 7
- Vite 5
- Tailwind CSS 4
- Axios
- Vitest + ESLint

## Project Structure

- `src/pages`: route-level pages (`HomePage`, `RecipeDetailPage`)
- `src/components`: reusable UI components (`SearchBar`, `Pagination`, etc.)
- `src/services`: API calls to Spoonacular
- `src/utils`: utility functions and tests (error mapping)
- `src/constants`: static data (`cuisines`)

## Local Setup

1. Install dependencies:

```bash
pnpm install
```

2. Create your local environment file:

```bash
cp .env.example .env
```

3. Add your Spoonacular API key in `.env`:

```env
VITE_SPOONACULAR_API_KEY="your_spoonacular_api_key"
```

4. Start the development server:

```bash
pnpm dev
```