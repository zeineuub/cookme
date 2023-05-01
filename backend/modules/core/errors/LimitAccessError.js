const AppError = require('./AppError');

class LimitAccessError extends AppError {
  constructor(message) {
    const target = 'limit';
    const source = {};
    const code = 'LIMIT_ACCESS';
    const status = 403;

    super(status, code, message, target, source);
  }
}

module.exports = LimitAccessError;