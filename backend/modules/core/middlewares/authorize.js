const jwt = require('jsonwebtoken');

const i18n = require('../../core/services/i18n');
const db = require('../helpers/db');
const { logger } = require('../helpers/logger');

const { User } = db;

const AuthorizationError = require('../errors/AuthorizationError');
const LimitAccessError = require('../errors/LimitAccessError');

const DEFAULT_ALLOWED_STATUSES = ['active'];
const DEFAULT_ALLOWED_ROLES = ['client', 'agent'];

module.exports.authorize = (
  roles = DEFAULT_ALLOWED_ROLES,
  statuses = DEFAULT_ALLOWED_STATUSES,
  type = null,
) => async (req, res, next) => {
  /*
   * Check if authorization header is set
   * NOTE: Express headers are auto converted to lowercase
   */
  let token = req.headers['x-access-token'] || req.headers.authorization || req.query.token;
  if (token && token.startsWith('Bearer ')) {
    // Remove Bearer from string
    token = token.slice(7, token.length);
  }

  if (token) {
    try {
      /*
       * Try to decode & verify the JWT token
       * The token contains user's id ( it can contain more informations )
       * and this is saved in req.user object
       */
      const tokenData = jwt.verify(token, process.env.JWT_SECRET);

      req.user = tokenData;

      const user = await User.findById(req.user.sub);

      if (!user) {
        logger('Authorization', `User #${req.user.sub} not found`);
        throw new AuthorizationError(i18n.__('user.authorization.invalid_token'));
      }

      roles.push('admin');
      if (user.role !== 'super' && (roles.includes('super') || !roles.includes(user.role))) {
        logger('Authorization', `User #${req.user.sub} doesn't have permission to access this server`);
        throw new LimitAccessError(i18n.__('user.authorization.access_permission'));
      }

      if (statuses.length > 0 && !statuses.includes(user.status)) {
        logger('Authorization', `User ${user.status} status not allowed`);
        throw new LimitAccessError(i18n.__('user.authorization.status_not_allowed'));
      }
    } catch (err) {
      /*
       * If the authorization header is corrupted, it throws exception
       * So return 401 status code with JSON error message
       */
      logger('Authorization', err);
      next(err);
    }
  } else {
    /*
     * If there is no autorization header, return 401 status code with JSON
     * error message
     */
    next(new AuthorizationError());
  }
  next();
};

module.exports.authorizedUser = () => async (req, res, next) => {
  const userId = req.params.userId;
  const loggedUser = req.user.sub;
  try {

    if (req.user.role === 'admin') {
      return next();
    }
    if (userId !== loggedUser) {
      logger('Authorization', `User #${req.user.sub} doesn't have permission to access this server`);
      throw new LimitAccessError(i18n.__('user.authorization.access_permission'));
    }
  } catch (err) {
    logger('Authorization', err);
    next(err);
  }
  next();
}