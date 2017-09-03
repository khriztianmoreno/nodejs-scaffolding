/**
 * @author: Cristian Moreno Zulauaga <khriztianmoreno@gmail.com>
 */

const config = require('../config/environment');
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');
const compose = require('composable-middleware');
const User = require('../api/user/user.model');

const validateJwt = expressJwt({
  secret: config.secrets.session,
});

/**
 * Attaches the user object to the request if authenticated
 * Otherwise returns 403
 */
function isAuthenticated() {
  return compose()
    // Validate jwt
    .use((req, res, next) => {
      // allow access_token to be passed through query parameter as well
      if (req.query && req.query.hasOwnProperty('access_token')) {
        req.headers.authorization = `Bearer ${req.query.access_token}`;
      }
      validateJwt(req, res, next);
    })
    // Attach user to request
    .use((req, res, next) => {
      User.findById(req.user._id).exec()
        .then((user) => {
          if (!user) {
            return res.status(401).end();
          }
          req.user = user;
          next();
          return null;
        })
        .catch(err => next(err));
    });
}

/**
 * Checks if the user role meets the minimum requirements of the route
 */
function hasRole(roleRequired) {
  if (!roleRequired) {
    throw new Error('Required role needs to be set');
  }

  return compose()
    .use(isAuthenticated())
    .use((req, res, next) => {
      const { role } = req.user;
      if ((~config.userRoles.indexOf(role)) && (~roleRequired.indexOf(role))) {
        next();
      } else {
        res.status(403).send('Forbidden');
      }
    });
}

/**
* Decodifica el token para entregar el objeto
*
*/
function decodedToken(token) {
  const decoded = jwt.verify(token, config.secrets.session);
  return { _id: decoded._id, user: decoded.user };
}

/**
 * Returns a jwt token signed by the app secret
 */
function signToken(id, user) {
  return jwt.sign({ _id: id, user }, config.secrets.session, {
    expiresIn: 60 * 60 * 24,
  });
}

/**
 * Set token cookie directly for oAuth strategies
 */
function setTokenCookie(req, res) {
  if (!req.user) {
    return res.status(404).send('It looks like you aren\'t logged in, please try again.');
  }
  const token = signToken(req.user._id, req.user);
  res.cookie('token', token);
  res.redirect('/');
  return true;
}

module.exports = { isAuthenticated, hasRole, decodedToken, signToken, setTokenCookie };
