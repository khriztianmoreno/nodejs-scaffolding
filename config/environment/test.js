/**
 * Test specific configuration
 * @author: Cristian Moreno Zulauaga <khriztianmoreno@gmail.com>
 */

module.exports = {
  // MongoDB connection options
  mongo: {
    uri: 'mongodb://localhost/nodejs-scaffolding-test',
  },
  sequelize: {
    uri: 'sqlite://',
    options: {
      logging: false,
      storage: 'test.sqlite',
      define: {
        timestamps: false,
      },
    },
  },
};
