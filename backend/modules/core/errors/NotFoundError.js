const AppError = require('./AppError');

class NotFoundError extends AppError {
  constructor(message) {
    super(404, 'NOT_FOUND', message || 'Not found.');
  }
}

module.exports = NotFoundError;
