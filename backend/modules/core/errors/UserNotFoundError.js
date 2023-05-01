const AppError = require('./AppError');

const i18n = require('../../core/services/i18n');

class UserNotFoundError extends AppError {
  constructor(message) {
    super(404, 'USER_NOT_FOUND', message || i18n.__('user.user_not_found'));
  }
}

module.exports = UserNotFoundError;
