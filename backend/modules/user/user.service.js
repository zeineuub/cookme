const db = require('../core/helpers/db');
const { ObjectId } = require('mongodb');

const i18n = require('../core/services/i18n');
const UserNotFoundError = require('../core/errors/UserNotFoundError');
const InvalidPasswordError = require('../core/errors/InvalidPasswordError');
const UnprocessableEntityError = require('../core/errors/UnprocessableEntityError');
const AuthenticationError = require('../core/errors/AuthenticationError');
const BadRequestError = require('../core/errors/BadrequestError');
const { logger } = require('../core/helpers/logger');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = db;


/**
 * Check the validity of the phoneNumber
 * @param value
 * @returns {Boolean}
 */
module.exports.isPhoneNumber = function isPhoneNumber(value) {
  
    if (value) {
      return (
        !!value.match(/^\+\d+$/) &&
        value.match(/^\+\d+$/).input.length === 12 &&
        value.substr(0, 4) === process.env.TN_PREFIX
      );
    }
    return false;
  };

/**
 * Check the validity of the email
 * @param value
 * @returns {Boolean}
 */
module.exports.isEmailAdress = function isEmailAddress(value) {
    if (value) {
      return /\S+@\S+\.\S+/.test(value);
    }
    return false;
  };
  /**
   * Create a User
   * @param data
   * @returns {User}
   */
  module.exports.create = async (data) => {
    const user = new User();
  
    let status = 'active';
  
    const { email, phoneNumber } = data;
    // checking the validity of the phone number
    if (!this.isPhoneNumber(phoneNumber)) {
      logger('User', `Phone number ${phoneNumber} is invalid`, 'create');
      throw new UnprocessableEntityError(
        i18n.__('user.validation.invalid_phone_number')
      );
    }
    // checking the validity of the email
    if (!this.isEmailAdress(email)) {
      logger('User', `Email ${email} is invalid`, 'upgrade');
      throw new UnprocessableEntityError(
        i18n.__('user.validation.invalid_email')
      );
    }
    console.log(data.language)
    Object.assign(user, {
      email: email.toLowerCase(),
      firstName: data.firstName,
      lastName: data.lastName,
      phoneNumber,
      password: data.password,
      status,
      language:data.language
    });
    await user.save();
    return user;
  };


/**
 * Update phone number
 * @param  { phoneNumber }
 * @param id
 * @returns {User}
 */
module.exports.updatePhoneNumber = async (userId, { phoneNumber }) => {
    const user = await this.getUserById(userId);
  
    //checking if there is a user with the same phone number
    const existingUser = await User.findOne({ phoneNumber });
  
    if (existingUser && existingUser.id != userId) {
      throw new UnprocessableEntityError(
        i18n.__('user.validation.assigned_phone_number')
      );
    }
  
    Object.assign(user, {
      phoneNumber,
    });
    await user.save();
    
    return user;
  };

  /**
 * Update a user
 * @param  data
 * @param id
 * @returns {User}
 */
module.exports.updateOne = async (userId, data) => {
    let user = await User.findById(userId);
    if (!user) {
      logger('User', `User #${id} not found`, 'update');
      throw new UserNotFoundError();
    }
    const { phoneNumber, email } = data;
  
    if (phoneNumber) {
      if (phoneNumber !== user.phoneNumber) {
        user = await this.updatePhoneNumber(userId, data);
      }
    }
  
    if (data.password && data.currentPassword && data.currentPassword !== '') {
      if (!user.comparePassword(data.currentPassword)) {
        throw new InvalidPasswordError();
      }
      Object.assign(user, {
        password: data.password,
      });
    }
    Object.assign(user, {
      email,
      firstName: data.firstName,
      lastName: data.lastName,
      language: data.language,
    });
  
    await user.save();
  
    return user;
  };
  
  /**
 * Check if the user is a guest
 * @param   phoneNumber
 * @returns {User}
 */
module.exports.checkIfUserExist = async ({ email }) => {
    const user = await User.findOne({
      email,
    });
    if (user) {
      throw new BadRequestError(
        i18n.__('registration.exist_user',user.firstName,user.lastName)
      );
    }
};


/**
 * Authentification
 * @param  email
 * @param password
 * @returns { data: { accessToken } }
 */
module.exports.authenticate = async ({ email, password }) => {
    const user = await User.findOne({ email });
    if (!user || !bcrypt.compareSync(password, user.password)) {
      throw new AuthenticationError(
        i18n.__('user.authentication.invalid_credentials')
      );
    }
  
    const payload = {
      sub: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      role: user.role,
    };
    
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET);
    let data = {
      accessToken,
      role: user.role,
    };
    i18n.setLocale(user.language);
    return data;
  };

/**
 * Returns a user by id
 * @param {String} id
 * @throws {UserNotFoundError} if user not found by id
 * @returns {User}
 */

module.exports.getUserById = async (id) => {
  const user = await User.findById(id, {
    __v: false,
    password: false,
  })
  .populate({
    path:'myRecipes',
    select:['title', 'ingredients', 'instructions','title','image','equipments','servings','readyInMinutes']
  });

  if (!user) {
    logger('User', `User #${id} not found`, 'getUserById');
    throw new UserNotFoundError('getUserById');
  }

  return user.myRecipes;
};


/**
 * Change Password
 * @param {String} id
 * @param {String} password
 * @param {String} currentPassword
 * @throws {UserNotFoundError}
 * @throws {InvalidPasswordError}
 * @returns {User}
 */
module.exports.changePassword = async (
    userId,
    { password, currentPassword }
  ) => {
  const user = await User.findById(userId);

  if (!user) {
    logger('User', `User #${id} not found`, 'getUserById');
    throw new UserNotFoundError('getUserById');
  }  

  if (!user.comparePassword(currentPassword)) {
    throw new InvalidPasswordError();
  }
  
  Object.assign(user, {
    password,
  });

  await user.save();

  return user;
};

/**
 * Forgot password
 * @param {Object} email
 * @throws {UserNotFoundError}
 * @returns {User}
 */
module.exports.forgotPassword = async ({ email }) => {
  const user = await User.findOne({ email });

  if (!user) {
    logger('User', `User with email ${email} not found`, 'forgotPassword');
    throw new UserNotFoundError(
      i18n.__('user.update.reset_password.email_not_found')
    );
  }
};

/**
 * Logout
 * @param {String} id
 * @throws {UserNotFoundError} if user not found by id
 */

module.exports.logout = async (id) => {
    const user = await this.getUserById(id);
};

/**
  * Set user preferences
  * @param {String} userId
  * @param {Object} data contains new user prefernces
  * @throws {UserNotFoundError} if user not found by Id
  * @returns {User}
  */
module.exports.updatePreferences = async(userId, data) => {
    const user = await User.findById(userId);
    if (!user) {
      logger('User', `User #${userId} not found`, 'getUserInfo');
      throw new UserNotFoundError('getUserInfo');
    }
    const {language} = data;
  
    Object.assign(user, data);
    
    await user.save();
    if (language) {
      i18n.setLocale(user.language);
    }
    return user;
  };

  
/**
 * Get user info
 * @param userId
 * @param role
 * @returns {User}
 */
module.exports.getUserInfo = async (userId, role) => {
  let loggedUser = await User.findById(userId, { __v: false, password: false });

  if (!loggedUser) {
    logger('User', `User #${userId} not found`, 'getUserInfo');
    throw new UserNotFoundError('getUserInfo');
  }

  loggedUser = loggedUser.toJSON();

  return loggedUser;
};