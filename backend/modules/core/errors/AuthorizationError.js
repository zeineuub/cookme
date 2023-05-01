const AppError = require('./AppError');

class AuthorizationError extends AppError {
  constructor(message) {
    super(401, 'AUTHENTICATE_TOKEN_INVALID', message || 'Failed to authenticate token!');
  }
}

module.exports = AuthorizationError;