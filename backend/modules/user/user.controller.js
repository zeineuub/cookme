const express = require('express');
const userService = require('./user.service');
const checkSchemaErrors = require('../core/middlewares/schema-erros');
const { checkSchema } = require('express-validator');
const {
  createUserSchema,
  updateUserSchema,
  resetPasswordSchema,
  verifyPhoneSchema,
  forgotPasswordSchema,
  changePasswordSchema,
  updateLanguageSchema,
} = require('./user.validation');
const { authorize } = require('../core/middlewares/authorize');
const { sendResetCode } = require('../core/services/mail');
const router = express.Router()
/**
 * Create User
 * @param req
 * @param res
 * @param next
 * @returns {user}
 */
function create(req, res, next) {
    userService
      .create(req.body)
      .then((user) => (user ? res.json(user) : res.sendStatus(204)))
      .catch((err) => next(err));
};

/**
 * Update User
 * @param req
 * @param res
 * @param next
 * @returns {user}
 */
function updateOne(req, res, next) {
    userService
      .updateOne(req.user.sub, req.body)
      .then((user) => (user ? res.json({user}) : res.sendStatus(204)))
      .catch((err) => next(err));
  };

/**
 * Delete User
 * @param req
 * @param res
 * @param next
 * @returns {user}
 */
function deleteOne(req, res, next) {
    userService
      .delete(req.params.id, req.body)
      .then((user) => (user ? res.json({user}) : res.sendStatus(204)))
      .catch((err) => next(err));
  };  

/**
 * Change password of current user
 * @param req
 * @param res
 * @param next
 * @returns {}
 */
function changePassword(req, res, next) {
    userService
      .changePassword(req.user.sub, req.body)
      .then(() => res.sendStatus(204))
      .catch((err) => next(err));
  };

/**
 * Forgot password
 * @param req
 * @param res
 * @param next
 * @returns {}
 */
function forgotPassword(req, res, next) {
    userService
      .forgotPassword(req.body)
      .then((user) => {
          sendResetCode(
           user.email,
           {
             code: user.resetPasswordCode,
             firstName: user.firstName,
             lastName: user.lastName,
           },
         );
        return user;
      })
      .then((data) => (data ? res.json({data}) : res.sendStatus(204)))
      .catch((err) => next(err));
  };
  
/**
 * Update preference
 * @param req
 * @param res
 * @param next
 * @returns {}
 */
function preferences(req, res, next) {
    userService
      .updatePreferences(req.user.sub, req.body)
      .then((data) => (data ? res.json({data}) : res.sendStatus(204)))
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
    .getRecipe(req.user.sub,req.params.recipeId, req.body)
    .then((recipe) => (recipe ? res.json(user) : res.sendStatus(204)))
    .catch((err) => next(err));
};
module.exports = router;

/**
 * POST /api/v1/users/change-password
 * Change password of current user
 */

router.post(
    '/change-password',
    authorize(['client']),
    checkSchema(changePasswordSchema),
    checkSchemaErrors,
    changePassword
  );
/**
 * POST /api/v1/users/forgot-password
 * Forgot password
 */

router.post(
    '/forgot-password',
    checkSchema(forgotPasswordSchema),
    checkSchemaErrors,
    forgotPassword
  );  

  
/**
 * POST /api/v1/user/
 * Create a user
 */
router.post('/', checkSchema(createUserSchema), checkSchemaErrors, create);



/**
 * PUT /api/v1/user/
 * Update a user
 */
router.put('/',
  authorize(['client', 'admin'],['active']),
  checkSchema(updateUserSchema),
  checkSchemaErrors,
  updateOne);


/**
 * DELETE /api/v1/user/:id
 * Delete a user
 */
router.delete(
    '/:id',
    authorize(['admin']),
    deleteOne
  );

/**
 * PUT /api/v1/user/language
 * update user preference
 */
router.put(
    '/language',
    checkSchema(updateLanguageSchema),
    checkSchemaErrors,
    authorize(['client', 'admin'], ['active']),
    preferences
)
/**
 * PUT /api/v1/user/favourite-recipe/:id
 * favourite recipe
 */
router.put(
  '/favourite-recipe/:id',
  authorize(['client', 'admin'], ['active']),
  favoriteRecipe
)
