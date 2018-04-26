/**
 * Using Rails-like standard naming convention for endpoints.
 * @author: Cristian Moreno Zuluaga <khriztianmoreno@gmail.com>
 */
const jwt = require('jsonwebtoken');

const User = require('./user.model');
const config = require('../../config/environment');

function validationError(res, statusCode) {
  const statusCodeLocal = statusCode || 422;
  return err => res.status(statusCodeLocal).json(err);
}

function handleError(res, statusCode) {
  const statusCodeLocal = statusCode || 500;
  return err => res.status(statusCodeLocal).send(err);
}

/**
 * Get list of users
 * restriction: 'admin'
 */
function index(req, res) {
  return User.find({}, '-salt -password').exec()
    .then(users => res.status(200).json(users))
    .catch(handleError(res));
}

/**
 * Creates a new user
 */
function create(req, res) {
  const newUser = new User(req.body);
  newUser.provider = 'local';
  newUser.role = 'user';

  console.log('User', newUser)

  newUser.save()
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        config.secrets.session,
        { expiresIn: 60 * 60 * 5 }
      );
      res.json({ token });
    })
    .catch(validationError(res));
}

/**
 * Get a single user
 */
function show(req, res, next) {
  const userId = req.params.id;

  return User.findById(userId).exec()
    .then((user) => {
      if (!user) {
        return res.status(404).end();
      }
      return res.json(user.profile);
    })
    .catch(err => next(err));
}

/**
 * Deletes a user
 * restriction: 'admin'
 */
function destroy(req, res) {
  return User.findByIdAndRemove(req.params.id).exec()
    .then(() => res.status(204).end())
    .catch(handleError(res));
}

/**
 * Change a users password
 */
function changePassword(req, res) {
  const userId = req.user._id;
  const oldPass = String(req.body.oldPassword);
  const newPass = String(req.body.newPassword);

  return User.findById(userId).exec()
    .then((user) => {
      if (user.authenticate(oldPass)) {
        const userChange = user;
        userChange.password = newPass;
        return userChange.save()
          .then(() => {
            res.status(204).end();
          })
          .catch(validationError(res));
      }

      return res.status(403).end();
    });
}

/**
 * Get my info
 */
function me(req, res, next) {
  const userId = req.user._id;

  return User.findOne({ _id: userId }, '-salt -password').exec()
    .then((user) => { // don't ever give out the password or salt
      if (!user) {
        return res.status(401).end();
      }
      return res.json(user);
    })
    .catch(err => next(err));
}

/**
 * Authentication callback
 */
function authCallback(req, res) {
  res.redirect('/');
}

module.exports = {
  index,
  show,
  create,
  destroy,
  changePassword,
  me,
  authCallback,
};
