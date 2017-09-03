/**
 * Auth Google passport configuration
 * @author: Cristian Moreno Zulauaga <khriztianmoreno@gmail.com>
 */

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

function setup(User, config) {
  passport.use(new GoogleStrategy({
    clientID: config.google.clientID,
    clientSecret: config.google.clientSecret,
    callbackURL: config.google.callbackURL,
  },
  (accessToken, refreshToken, profile, done) => {
    User.findOne({ 'google.id': profile.id }).exec()
      .then(user => {
        if (user) {
          return done(null, user);
        }

        user = new User({
          name: profile.displayName,
          email: profile.emails[0].value,
          role: 'user',
          username: profile.emails[0].value.split('@')[0],
          provider: 'google',
          google: profile._json,
        });
        user.save()
          .then(user => done(null, user))
          .catch(err => done(err));
      })
      .catch(err => done(err));
  }));
}

module.exports = { setup };
