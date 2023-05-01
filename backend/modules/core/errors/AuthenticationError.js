const AppError = require('./AppError');

class AuthenticationError extends AppError {
  constructor(message) {
    super(401, 'INVALID_CREDENTIALS', message || 'Username or password is incorrect.');
  }
}

module.exports = AuthenticationError;
