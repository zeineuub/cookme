
const AppError = require('./AppError');

class NotAcceptableError extends AppError {
  constructor(message) {
    super(406, 'NOT_ACCEPTABLE', message || 'Not acceptable.');
  }
}

module.exports = NotAcceptableError;
