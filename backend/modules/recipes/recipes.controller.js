const express = require('express');
const recipeService = require('./recipes.service');
const checkSchemaErrors = require('../core/middlewares/schema-erros');
const { checkSchema } = require('express-validator');
const { authorize } = require('../core/middlewares/authorize');
const {createRecipe,searchRecipe } = require('./recipes.validation');
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
 * Create Recipe
 * @param req
 * @param res
 * @param next
 * @returns {user}
 */
function getComments(req, res, next) {
    recipeService
      .getComments(req.params.recipeId)
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
* Favorite recipe
* @param req
* @param res
* @param next
* @returns {recipe}
*/
function updateFavorite(req, res, next) {
   recipeService
     .updateFavorite(req.user.sub,req.params.recipeId, req.body)
     .then((recipe) => (recipe ? res.json(recipe) : res.sendStatus(204)))
     .catch((err) => next(err));
};
/**
 * update recipe
 * @param req
 * @param res
 * @param next
 * @returns {recipe}
 */
function updateRecipe(req, res, next) {
    recipeService
      .updateRecipe(req.user.sub,req.params.id, req.body)
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
      .delete(req.user.sub,req.params.recipeId)
      .then((recipe) => (recipe ? res.json(recipe) : res.sendStatus(204)))
      .catch((err) => next(err));
};
/**
 * Get saved recipe by id
 * @param req
 * @param res
 * @param next
 * @returns {recipe}
 */
function isSaved(req, res, next) {
    recipeService
      .isSaved(req.user.sub,req.params.recipeId)
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
function favoriteRecipe(req, res, next) {
    recipeService
      .checkFavorite(req.user.sub,req.params.recipeId)
      .then((recipe) => (recipe ? res.json(recipe) : res.sendStatus(204)))
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
      .updateRating(req.user.sub,req.params.recipeId, req.body)
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
      .addcomment(req.user.sub,req.params.recipeId, req.body)
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
    '/:recipeId',
    authorize(['client']),
    deleteOne
);
/**
 * PUT /api/v1/recipes/:id
 * make the recipe one of my fav
 */

router.put(
    '/:id',
    authorize(['client']),
    updateRecipe
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
 * POST /api/v1/recipes/save
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
 * GET /api/v1/user/favorite/:recipeId
 * favourite recipe
 */
router.get(
    '/favorite/:recipeId',
    authorize(['client', 'admin'], ['active']),
    favoriteRecipe
);
 /**
 * PUT /api/v1/recipes/:id
 * add comment 
 */

router.post(
    '/comment/:recipeId',
    authorize(['client']),
    addComment
);
/**
 * PUT /api/v1/recipes/rating/:id
 * Update recipe rating 
 */

router.put(
    '/rating/:recipeId',
    authorize(['client']),
    updateRating
); 
/**
 * PUT /api/v1/recipes/rating/:id
 * Update recipe rating 
 */

router.put(
    '/favorite/:recipeId',
    authorize(['client']),
    updateFavorite
); 

/**
 * PUT /api/v1/recipes/rating/:id
 * Update recipe rating 
 */

router.get(
    '/saved/:recipeId',
    authorize(['client']),
    isSaved
);
/**
 * PUT /api/v1/recipes/rating/:id
 * Update recipe rating 
 */

router.get(
    '/comments/:recipeId',
    authorize(['client']),
    getComments
); 