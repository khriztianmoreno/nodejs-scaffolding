/**
 * Main application file
 */

const express = require('express');
const mongoose = require('mongoose');
const config = require('./config/environment');
const http = require('http');
const winston = require('winston');
const expressConfig = require('./config/express');
const routeConfig = require('./routes');

mongoose.Promise = require('bluebird');

// Connect to MongoDB
mongoose.connect(config.mongo.uri, config.mongo.options);
mongoose.connection.on('error', (err) => {
  winston.error('Error', 'MongoDB connection error', {
    data: err,
    time: new Date().toISOString(),
  });
  process.exit(-1);
});

// Setup server
const app = express();
const server = http.createServer(app);

expressConfig(app);
routeConfig(app);

// Start server
function startServer() {
  app.angularFullstack = server.listen(config.port, config.ip, () => {
    winston.info(`Express server listening on ${config.port}, in ${app.get('env')} mode`);
  });
}

setImmediate(startServer);

// Expose app
module.exports = app;
