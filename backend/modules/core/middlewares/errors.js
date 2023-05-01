const AppError = require('../errors/AppError');

/**
 * Error handler.
 */

function handler(err, req, res, next) {
  const errors = [];

  // Check app Errors
  if (err instanceof AppError) {
    errors.push(err.toJson());
    return res.status(err.status).json({ errors });
  }

  // Check mongoose validation error
  if (err.name === 'ValidationError') {
    for (const [field, e] of Object.entries(err.errors)) {
      errors.push({
        code: 'is_invalid',
        target: 'field',
        message: e.message,
        source: { field },
      });
    }
    return res.status(422).json({ errors });
  }

  // default to 500 server error
  res.status(500).json({
    errors: [
      {
        code: 'internal_server_error',
        target: 'common',
        message: err.message,
        source: {},
      },
    ],
  });

  next();
  return false;
}

module.exports = handler;
