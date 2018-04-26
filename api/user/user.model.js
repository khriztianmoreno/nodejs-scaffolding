/**
 * user model
 * @author: Cristian Moreno Zuluaga <khriztianmoreno@gmail.com>
 */

const mongoose = require('mongoose');
const crypto = require('crypto');

const Schema = mongoose.Schema;
const authTypes = ['github', 'twitter', 'facebook', 'google'];
mongoose.Promise = require('bluebird');

const FriendsSchema = new Schema({
  id: { type: String, uppercase: true },
  name: { type: String, uppercase: true },
  picture: { type: String, lowercase: true },
}, { _id: false });

const UserSchema = new Schema({
  name: { type: String, uppercase: true, required: true },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    required: (() => {
      if (authTypes.indexOf(this.provider) === -1) {
        return true;
      }
      return false;
    }, this),
  },
  role: { type: String, default: 'label' },
  password: {
    type: String,
    required: (() => {
      if (authTypes.indexOf(this.provider) === -1) {
        return true;
      }
      return false;
    }, this),
  },
  friends: FriendsSchema,
  provider: String,
  salt: String,
  facebook: {},
  twitter: {},
  google: {},
  github: {},
  active: { type: Boolean, default: true },
  passwordResetToken: String,
  passwordResetExpires: Date,
}, { timestamps: true });


UserSchema.path('role').validate(value => /admin|label|user/i.test(value), 'role, assigned role is invalid');

/**
 * Virtuals
 */

// Public profile information
UserSchema
.virtual('profile')
.get((() => ({ name: this.name, role: this.role }), this));

// Non-sensitive info we'll be putting in the token
UserSchema
.virtual('token')
.get((() => ({ _id: this._id, role: this.role }), this));

/**
* Validations
*/

// Validate empty email
UserSchema
.path('email')
.validate(function(email) {
  if (authTypes.indexOf(this.provider) !== -1) {
    return true;
  }
  return email.length;
}, 'Email cannot be blank');

// Validate empty password
UserSchema
.path('password')
.validate(function(password) {
  if (authTypes.indexOf(this.provider) !== -1) {
    return true;
  }
  return password.length;
}, 'Password cannot be blank');

// Validate email is not taken
UserSchema
.path('email')
.validate(function(value) {
  if (authTypes.indexOf(this.provider) !== -1) {
    return true;
  }

  return this.constructor.findOne({ email: value }).exec()
    .then(user => {
      if (user) {
        if (this.id === user.id) {
          return true;
        }
        return false;
      }
      return true;
    })
    .catch(function(err) {
      throw err;
    });
}, 'The specified email address is already in use.');

const validatePresenceOf = value => value && value.length;

/**
* Pre-save hook
*/
UserSchema
.pre('save', function(next) {
  // Handle new/update passwords
  if (!this.isModified('password')) {
    return next();
  }

  if (!validatePresenceOf(this.password)) {
    if (authTypes.indexOf(this.provider) === -1) {
      return next(new Error('Invalid password'));
    } else {
      return next();
    }
  }

  // Make salt with a callback
  this.makeSalt((saltErr, salt) => {
    if (saltErr) {
      return next(saltErr);
    }
    this.salt = salt;
    this.encryptPassword(this.password, (encryptErr, hashedPassword) => {
      if (encryptErr) {
        return next(encryptErr);
      }
      this.password = hashedPassword;
      return next();
    });
  });
});

/**
* Methods
*/
UserSchema.methods = {
  /**
   * Authenticate - check if the passwords are the same
   *
   * @param {String} password
   * @param {Function} callback
   * @return {Boolean}
   * @api public
   */
  authenticate(password, callback) {
    if (!callback) {
      return this.password === this.encryptPassword(password);
    }

    this.encryptPassword(password, (err, pwdGen) => {
      if (err) {
        return callback(err);
      }

      if (this.password === pwdGen) {
        return callback(null, true);
      } else {
        return callback(null, false);
      }
    });
  },

  /**
   * Make salt
   *
   * @param {Number} [byteSize] - Optional salt byte size, default to 16
   * @param {Function} callback
   * @return {String}
   * @api public
   */
  makeSalt(...args) {
    let byteSize;
    let callback;
    let defaultByteSize = 16;

    if (typeof args[0] === 'function') {
      callback = args[0];
      byteSize = defaultByteSize;
    } else if (typeof args[1] === 'function') {
      callback = args[1];
    } else {
      throw new Error('Missing Callback');
    }

    if (!byteSize) {
      byteSize = defaultByteSize;
    }

    return crypto.randomBytes(byteSize, (err, salt) => {
      if (err) {
        return callback(err);
      } else {
        return callback(null, salt.toString('base64'));
      }
    });
  },

  /**
   * Encrypt password
   *
   * @param {String} password
   * @param {Function} callback
   * @return {String}
   * @api public
   */
  encryptPassword(password, callback) {
    if (!password || !this.salt) {
      if (!callback) {
        return null;
      } else {
        return callback('Missing password or salt');
      }
    }

    const defaultIterations = 10000;
    const defaultKeyLength = 64;
    const salt = new Buffer(this.salt, 'base64');

    if (!callback) {
      // eslint-disable-next-line no-sync
      return crypto.pbkdf2Sync(password, salt, defaultIterations,
          defaultKeyLength, 'sha1')
        .toString('base64');
    }

    return crypto.pbkdf2(password, salt, defaultIterations, defaultKeyLength,
      'sha1', (err, key) => {
        if (err) {
          return callback(err);
        } else {
          return callback(null, key.toString('base64'));
        }
      });
  }
};

module.exports = mongoose.model('User', UserSchema);
