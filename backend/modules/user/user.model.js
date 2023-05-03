const mongoose = require("mongoose")
const beautifyUnique = require('mongoose-beautiful-unique-validation');
const { Schema } = mongoose;
const bcrypt = require('bcryptjs');
const SALT_WORK_FACTOR = 10;
const STATUS_ACTIVE = 'active';

const ROLE_ADMIN = 'admin';
const ROLE_CLIENT = 'client';
const UserSchema = new Schema({
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    phoneNumber : {
        type :String
    },
    email: {
        type: String
    },
    password: {
        type: String,
      },
    language: {
        type: String,
        enum: ['fr', 'en', 'ar', 'tn', 'unknown'],
        default: 'unknown',
    },
    resetPasswordCode: {
        type: String,
      },
    resetPasswordExpires: {
        type: Date,
      },
    resetPasswordAttempts: {
        type: Number,
    },
    role: {
        type: String,
        enum: [ROLE_CLIENT, ROLE_ADMIN],
        default: ROLE_CLIENT,
    },
    status: {
        type: String,
        enum: [STATUS_ACTIVE],
    },
    myRecipes: [{
      _id: {
        type: Schema.Types.ObjectId,
        ref: 'Recipe'
      },
      favorite: {
        type: Boolean,
        default: false
      },
      tried: {
        type: Boolean,
        default: false
      },
      rating: {
        type: Number,
        default:0
      },
    }]
},
{
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    },
    toObject: {
      virtuals: true,
    },
}
);
UserSchema.pre('save', function (next) {
    const user = this;
  
    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next();
  
    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
      if (err) return next(err);
  
      // hash the password using our new salt
      bcrypt.hash(user.password, salt, (err2, hash) => {
        if (err2) return next(err2);
  
        // override the cleartext password with the hashed one
        user.password = hash;
        next();
        return false;
      });
      return false;
    });
    return false;
  });
  UserSchema.methods = {
    comparePassword(candidatePassword) {
      return bcrypt.compareSync(candidatePassword, this.password);
    },
    responseData() {
      return {
        firstName: this.firstName,
        lastName: this.lastName,
        phoneNumber: this.phoneNumber,
        email: this.email,
        role: this.role,
      };
    },

    getName() {
      return this.status === 'active'
        ? `${this.firstName} ${this.lastName}`
        : `${this.phoneNumber}`;
    },
  };

  UserSchema.index(
    {
      email: 1,
    },
    {
      partialFilterExpression: {
        email: { $exists: true },
      },
      unique: true,
    }
  );
  
  UserSchema.index(
    {
      phoneNumber: 1,
    },
    {
      partialFilterExpression: {
        phoneNumber: { $exists: true },
      },
      unique: true,
    }
  );
  UserSchema.plugin(beautifyUnique, {
    defaultMessage: '{VALUE} est déja inscrit',
  });
  UserSchema.set('toJSON', { virtuals: true });
  
/**
 * toJSON implementation
 */
UserSchema.options.toJSON = {
    transform(doc, ret) {
      const r = ret;
      r.name = doc.name;
      r.id = r._id;
      delete r._id;
      delete r.__v;
      return r;
    },
  };
module.exports = mongoose.model('User', UserSchema);