const i18n = require('../core/services/i18n');

const MIN_PASSWORD_LENGTH = 6;

/**
 * PUT /api/v1/user
 */

module.exports.updateUserSchema = {
  email: {
    exists: {
      errorMessage: i18n.__('user.validation.required_email'),
    },
    isEmail: {
      errorMessage: i18n.__('user.validation.invalid_email'),
    },
  },
  firstName: {
    exists: {
      errorMessage: i18n.__('user.validation.required_firstName'),
    },
    isLength: {
      errorMessage: i18n.__('user.validation.firstName_length'),
      options: { min: 1, max: 45 },
    },
  },
  lastName: {
    exists: {
      errorMessage: i18n.__('user.validation.required_lastName'),
    },
    isLength: {
      errorMessage: i18n.__('user.validation.lastName_length'),
      options: { min: 1, max: 45 },
    },
  },
  currentPassword: {
    custom: {
      options: (value, { req }) => {
        if (req.body.currentPassword && req.body.currentPassword !== '') {
          if (!value || value === '') {
            throw new Error('Current password is required');
          }
          return value;
        }
        return true;
      },
    },
  },
  password: {
    custom: {
      options: (value, { req }) => {
        if (req.body.password && req.body.password !== '') {
          if (!value || value === '') {
            throw new Error(i18n.__('user.validation.required_password'));
          }

          if (value.length < MIN_PASSWORD_LENGTH) {
            throw new Error(i18n.__('user.validation.short_password'));
          }

          return value;
        }
        return true;
      },
    },
  },
};

/**
 * POST /api/v1/user
 */

module.exports.createUserSchema = {
  email: {
    exists: {
      errorMessage: i18n.__('user.validation.required_email'),
    },
    isEmail: {
      errorMessage: i18n.__('user.validation.invalid_email'),
    },
  },
  firstName: {
    exists: {
      errorMessage: i18n.__('user.validation.required_firstName'),
    },
    isLength: {
      errorMessage: i18n.__('user.validation.firstName_length'),
      options: { min: 1, max: 45 },
    },
  },
  lastName: {
    exists: {
      errorMessage: i18n.__('user.validation.required_lastName'),
    },
    isLength: {
      errorMessage: i18n.__('user.validation.lastName_length'),
      options: { min: 1, max: 45 },
    },
  },
  phoneNumber: {
    exists: {
      errorMessage: i18n.__('user.validation.required_phone_number'),
    },
    isMobilePhone: {
      errorMessage: i18n.__('user.validation.invalid_phone_number'),
    },
  },
  password: {
    exists: {
      errorMessage: i18n.__('user.validation.required_password'),
    },
  },
};

/**
 * POST /api/v1/user/login
 */

module.exports.loginSchema = {
  email: {
    exists: {
      errorMessage: i18n.__('user.validation.required_email'),
    },
    isEmail: {
      errorMessage: i18n.__('user.validation.invalid_email'),
    },
  },
  password: {
    exists: {
      errorMessage: i18n.__('user.validation.required_password'),
    },
  },
};

/**
 * POST /api/v1/auth/change-password
 */

module.exports.changePasswordSchema = {
  currentPassword: {
    exists: {
      errorMessage: i18n.__('user.validation.required_current_password'),
    },
  },
  password: {
    isLength: {
      errorMessage: i18n.__('user.validation.short_password'),
      // Multiple options would be expressed as an array
      options: { min: MIN_PASSWORD_LENGTH },
    },
  },
};

/**
 * POST /api/v1/auth/forgot-password
 */

module.exports.forgotPasswordSchema = {
  email: {
    isEmail: {
      errorMessage: 'Invalid email.',
    },
  },
};

/**
 * POST /api/v1/user/language
 */

 module.exports.updateLanguageSchema = {
  
  language: {
    exists: {
      errorMessage: i18n.__('vehicle.validation.required_language'),
    },
    custom: {
      options: (value, { req }) => {
        if (req.body.language) {
          const types = ['fr', 'en', 'ar', 'tn', 'unknown'];
          if (!types.includes(req.body.language)) {
            throw new Error(`Language must be either one of ${types}`);
          }
          return value;
        }
        return true;
      },
    },
  },
};