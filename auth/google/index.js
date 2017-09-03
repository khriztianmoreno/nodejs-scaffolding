/**
 * Auth Google configuration
 * @author: Cristian Moreno Zulauaga <khriztianmoreno@gmail.com>
 */

const express = require('express');
const passport = require('passport');
const setTokenCookie = require('../auth.service').setTokenCookie;

const router = express.Router();

router
  .get('/', passport.authenticate('google', {
    failureRedirect: '/signup',
    scope: [
      'profile',
      'email',
    ],
    session: false,
  }))
  .get('/callback', passport.authenticate('google', {
    failureRedirect: '/signup',
    session: false,
  }), setTokenCookie);

module.exports = router;
