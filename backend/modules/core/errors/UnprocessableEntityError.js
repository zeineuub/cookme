const AppError = require('./AppError');

class UnprocessableEntityError extends AppError {
  constructor(message, code, target, source, extra) {
    const errorCode = code || 'UNPROCESSABLE_ENTITY';
    const errorMessage = message || 'Unprocessable entity.';
    super(422, errorCode, errorMessage, target, source);
    this.extra = extra;
  }
}

module.exports = UnprocessableEntityError;
