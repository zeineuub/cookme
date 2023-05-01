const AppError = require('./AppError');

const i18n = require('../../core/services/i18n');


class InvalidPasswordError extends AppError {
  constructor(message) {
    const errMsg = message || i18n.__('user.update.reset_password.invalid_password');
    const target = 'field';
    const source = { field: 'currentPassword' };

    super(422, 'INVALID_PASSWORD', errMsg, target, source);
  }
}

module.exports = InvalidPasswordError;
