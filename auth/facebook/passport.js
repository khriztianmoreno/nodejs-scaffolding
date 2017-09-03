/**
 * Auth Facebook passport configuration
 * @author: Cristian Moreno Zulauaga <khriztianmoreno@gmail.com>
 */

const passport = require('passport');
const FacebookTokenStrategy = require('passport-facebook-token');

function setup(User, config) {
  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((user, done) => {
    done(null, user);
  });

  passport.use(new FacebookTokenStrategy({
    clientID: config.facebook.clientID,
    clientSecret: config.facebook.clientSecret,
    profileFields: [
      'displayName',
      'emails',
    ],
  },
  (accessToken, refreshToken, profile, done) => {
    User.findOne({ 'facebook.id': profile.id }).exec()
      .then((user) => {
        if (user) {
          return done(null, user);
        }

        let userToSave = user;

        userToSave = new User({
          name: profile.displayName,
          email: profile.emails[0].value,
          role: 'mobi-app',
          provider: 'facebook',
          facebook: profile._json,
        });

        userToSave.save()
          .then(userSave => done(null, userSave))
          .catch(err => done(err));
      })
      .catch(err => done(err));
  }));
}

module.exports = { setup };
