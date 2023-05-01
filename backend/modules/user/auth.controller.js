const express = require('express');
const userService = require('./user.service');
const { checkSchema } = require('express-validator');

const checkSchemaErrors = require('../core/middlewares/schema-erros');
const { createUserSchema, loginSchema } = require('./user.validation');
const { authorize } = require('../core/middlewares/authorize');

const router = express.Router();

/**
 * Login a new user
 * @param req
 * @param res
 * @param next
 * @returns {data}
 */

function login(req, res, next) {
  userService
    .authenticate({
      email: req.body.email,
      password: req.body.password,
      pushToken: req.body.pushToken,
    })
    .then((result) => res.json(result))
    .catch((err) => next(err));
}

/**
 * Register a new user and returns jwt token if registration was successful
 * @param req
 * @param res
 * @param next
 * @returns {}
 */

function registrationProcess(user, req, res, guest = false) {
    const authData = {
        email: req.body.email,
        password: req.body.password,
      }
    userService.authenticate(authData)
    .then((result) => res.json(result))

}

/**
 * Register User
 * @param req
 * @param res
 * @param next
 * @returns {}
 */
function registration(req, res, next) {
  userService
    .checkIfUserExist(req.body)
    .then(() => {
        userService
          .create(req.body)
          .then((user) => registrationProcess(user, req, res))
          .catch((err) => next(err));
    })
    .catch((err) => next(err));
}


/**
 * Get current user info
 * @param req
 * @param res
 * @param next
 * @returns {}
 */

 function me(req, res, next) {
  userService.getUserInfo(req.user.sub, 'client')
    .then(data => res.json(data))
    .catch(err => next(err));
}

/**
 * Log out
 * @param req
 * @param res
 * @param next
 * @returns {}
 */

 function logout(req, res, next) {
  userService.logout(req.user.sub)
    .then(() => res.sendStatus(204))
    .catch(err => next(err));
}
module.exports = router;
/**
 * POST /api/v1/auth/login
 * Login user with email and password
 */
router.post('/login', checkSchema(loginSchema), checkSchemaErrors, login);

/**
 * POST /api/v1/auth/register
 * Register a new user
 */
router.post(
  '/register',
  checkSchema(createUserSchema),
  checkSchemaErrors,
  registration
);

/**
 * GET /api/v1/auth/me
 * Get current user info
 */
 router.get('/me', authorize(['client', 'admin'], ['active']), me);

/**
 * GET /api/v1/auth/logout
 * Logout
 */

router.get('/logout', authorize(['client', 'admin'], ['active']), logout);
