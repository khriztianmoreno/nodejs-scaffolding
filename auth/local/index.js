/**
 * Auth Local configuration
 * @author: Cristian Moreno Zulauaga <khriztianmoreno@gmail.com>
 */

const express = require('express');
const passport = require('passport');
const signToken = require('../auth.service').signToken;

const router = express.Router();

router.post('/', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    const error = err || info;
    if (error) {
      return res.status(401).json(error);
    }
    if (!user) {
      return res.status(404).json({ message: 'Something went wrong, please try again.' });
    }
    const userToken = {
      name: user.name,
      email: user.email,
      additionalData: user.additionalData,
    };
    const token = signToken(user._id, userToken);
    return res.json({ token });
  })(req, res, next);
});

module.exports = router;
