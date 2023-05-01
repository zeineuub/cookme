const express = require('express');
const recipeService = require('./recipes.service');
const checkSchemaErrors = require('../core/middlewares/schema-erros');
const { checkSchema } = require('express-validator');
const { authorize } = require('../core/middlewares/authorize');
const { favoriteRecipe, createRecipe,searchRecipe } = require('./recipes.validation');
const router = express.Router()

/**
 * Create Recipe
 * @param req
 * @param res
 * @param next
 * @returns {user}
 */
function createOne(req, res, next) {
    recipeService
      .create(req.body)
      .then((recipe) => (recipe ? res.json(recipe) : res.sendStatus(204)))
      .catch((err) => next(err));
};
/**
 * Add recipe to user's list
 * @param req
 * @param res
 * @param next
 * @returns {recipe}
 */
function saveRecipe(req, res, next) {
    recipeService
      .saveRecipe(req.user.sub, req.body)
      .then((recipe) => (recipe ? res.json(recipe) : res.sendStatus(204)))
      .catch((err) => next(err));
};
/**
 * List of recipes saved by user
 * @param req
 * @param res
 * @param next
 * @returns {recipes}
 */
function getSavedRecipesByUserId(req, res, next) {
    recipeService
      .getSavedRecipesByUserId(req.user.sub)
      .then((recipes) => (recipes ? res.json(recipes) : res.sendStatus(204)))
      .catch((err) => next(err));
};
/**
 * Get a recipe by id
 * @param req
 * @param res
 * @param next
 * @returns {recipe}
 */
function getOne(req, res, next) {
    recipeService
      .getRecipe(req.params.id)
      .then((recipe) => (recipe ? res.json(recipe) : res.sendStatus(204)))
      .catch((err) => next(err));
};
/**
 * Favorite recipe
 * @param req
 * @param res
 * @param next
 * @returns {recipe}
 */
function updateFavorite(req, res, next) {
    recipeService
      .updateFavorite(req.user.sub,req.params.id, req.body)
      .then((recipe) => (recipe ? res.json(recipe) : res.sendStatus(204)))
      .catch((err) => next(err));
};
/**
 * Search recipes by ingredients
 * @param req
 * @param res
 * @param next
 * @returns {recipe}
 */
function searchByIngredients(req, res, next) {
    recipeService
      .searchByIngredients(req.body)
      .then((recipes) => (recipes ? res.json(recipes) : res.sendStatus(204)))
      .catch((err) => next(err));
};
/**
 * Delete a recipe by id
 * @param req
 * @param res
 * @param next
 * @returns {recipe}
 */
function deleteOne(req, res, next) {
    recipeService
      .delete(userId,req.params.id)
      .then((user) => (user ? res.json(user) : res.sendStatus(204)))
      .catch((err) => next(err));
};
/**
 * Delete a recipe by id
 * @param req
 * @param res
 * @param next
 * @returns {recipe}
 */
function updateRating(req, res, next) {
    recipeService
      .updateRating(userId,req.params.id, req.body)
      .then((user) => (user ? res.json(user) : res.sendStatus(204)))
      .catch((err) => next(err));
};
/**
 * Add a comment to a recipe
 * @param req
 * @param res
 * @param next
 * @returns {recipe}
 */
function addComment(req, res, next) {
    recipeService
      .addComment(userId,req.params.id, req.body)
      .then((user) => (user ? res.json(user) : res.sendStatus(204)))
      .catch((err) => next(err));
};
module.exports = router;
/**
 * POST /api/v1/recipes/
 * Create recipe
 */

router.post(
    '/',
    authorize(['client']),
    checkSchema(createRecipe),
    checkSchemaErrors,
    createOne
);
/**
 * DELETE /api/v1/recipes/:id
 * delete a recipe
 */

router.delete(
    '/:id',
    authorize(['client']),
    deleteOne
);
/**
 * GET /api/v1/recipes/:id
 * get a recipe by id
 */

router.get(
    '/:id',
    authorize(['client']),
    getOne
);
/**
 * GET /api/v1/recipes/saved
 * get saved recipes by user
 */

router.get(
    '/saved',
    authorize(['client']),
    getSavedRecipesByUserId
);

/**
 * GET /api/v1/recipes/search
 * search for recipes by ingredients
 */

router.post(
    '/search',
    checkSchema(searchRecipe),
    checkSchemaErrors,
    searchByIngredients
);

/**
 * POST /api/v1/recipes/save-recipe
 * save recipe for user
 */

router.post(
    '/save',
    authorize(['client']),
    checkSchema(createRecipe),
    checkSchemaErrors,
    saveRecipe
);
/**
 * POST /api/v1/recipes/save-recipe
 * favorite recipe
 */

router.put(
    '/favorite',
    authorize(['client']),
    checkSchema(favoriteRecipe),
    checkSchemaErrors,
    updateFavorite
);
/**
 * GET /api/v1/recipes/:id
 * add comment 
 */

router.post(
    '/comment/:id',
    authorize(['client']),
    addComment
);
/**
 * PUT /api/v1/recipes/rating/:id
 * Update recipe rating 
 */

router.get(
    '/rating/:id',
    authorize(['client']),
    updateRating
);
