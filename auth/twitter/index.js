/**
 * Auth Twitter configuration
 * @author: Cristian Moreno Zulauaga <khriztianmoreno@gmail.com>
 */

const express = require('express');
const passport = require('passport');
const setTokenCookie = require('../auth.service').setTokenCookie;

const router = express.Router();

router
  .get('/', passport.authenticate('twitter', {
    failureRedirect: '/signup',
    session: false,
  }))
  .get('/callback', passport.authenticate('twitter', {
    failureRedirect: '/signup',
    session: false,
  }), setTokenCookie);

module.exports = router;
