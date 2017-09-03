/**
 * Development specific configuration
 * @author: Cristian Moreno Zulauaga <khriztianmoreno@gmail.com>
 */

module.exports = {

  // MongoDB connection options
  mongo: {
    uri: 'mongodb://localhost/nodejs-scaffolding-dev',
  },

  // Seed database on startup
  seedDB: false,

};
