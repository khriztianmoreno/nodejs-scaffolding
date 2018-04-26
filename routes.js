/**
 * Main application routes
 */

const errors = require('./components/errors');
const path = require('path');
const cors = require('cors');

// Import Endpoints
const helloWorld = require('./api/helloWorld');
const user = require('./api/user');
const auth = require('./auth');

module.exports = (app) => {
  const whitelist = [
    'http://localhost:3030',
    'http://localhost:8080',
  ];

  const corsOptions = {
    origin: whitelist,
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  };

  app.use(cors(corsOptions));

  // Insert routes below
  app.use('/api/helloworld', helloWorld);
  app.use('/api/users', user);

  app.use('/auth', auth);

  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
   .get(errors[404]);

  // All other routes should redirect to the index.html
  app.route('/*')
    .get((req, res) => {
      res.sendFile(path.resolve(`${app.get('appPath')}/index.html`));
    });
};
