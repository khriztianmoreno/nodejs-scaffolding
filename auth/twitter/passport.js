/**
 * Auth Facebook passport configuration
 * @author: Cristian Moreno Zulauaga <khriztianmoreno@gmail.com>
 */

const passport = require('passport');
const TwitterStrategy = require('passport-twitter').Strategy;

function setup(User, config) {
  passport.use(new TwitterStrategy({
    consumerKey: config.twitter.clientID,
    consumerSecret: config.twitter.clientSecret,
    callbackURL: config.twitter.callbackURL,
  },
  (token, tokenSecret, profile, done) => {
    User.findOne({ 'twitter.id': profile.id }).exec()
      .then(user => {
        if (user) {
          return done(null, user);
        }

        user = new User({
          name: profile.displayName,
          username: profile.username,
          role: 'user',
          provider: 'twitter',
          twitter: profile._json,
        });
        user.save()
          .then(user => done(null, user))
          .catch(err => done(err));
      })
      .catch(err => done(err));
  }));
}

module.exports = { setup };

