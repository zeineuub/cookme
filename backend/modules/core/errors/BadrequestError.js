const AppError = require('./AppError');

class BadRequestError extends AppError {
  constructor(message) {
    super(400, 'BAD_REQUEST', message || 'Bad Request.');
  }
}

module.exports = BadRequestError;
