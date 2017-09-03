/**
 * Auth configuration
 * @author: Cristian Moreno Zulauaga <khriztianmoreno@gmail.com>
 */

const express = require('express');
const config = require('../config/environment');
const User = require('../api/user/user.model');

const authLocal = require('./local/passport');
const authFacebook = require('./facebook/passport');
const authGoogle = require('./google/passport');
const authTwitter = require('./twitter/passport');

const configPassportLocal = require('./local');
const configPassportFacebook = require('./facebook');
const configPassportTwitter = require('./twitter');
const configPassportGoogle = require('./google');

// Passport Configuration
authLocal.setup(User, config);
authFacebook.setup(User, config);
authGoogle.setup(User, config);
authTwitter.setup(User, config);

const router = express.Router();

router.use('/local', configPassportLocal);
router.use('/facebook', configPassportFacebook);
router.use('/twitter', configPassportTwitter);
router.use('/google', configPassportGoogle);

module.exports = router;
