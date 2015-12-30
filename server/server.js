/**
 * Main server file.
 *
 * Created by hce on 08/07/15.
 *
 */

'use strict';

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var express = require('express'),
  config = require('./config/env'),
  logger = require('winston'),
  bodyParser = require('body-parser'),
  httpProxy = require('http-proxy'),
  docker = require('./docker/docker.js');

// Setup express app
var app = express();
app.use(bodyParser.json());


// Initialize the Winston logger level.
var initLogger = function (){

  // Winston supported levels: silly, input, verbose, prompt, debug, info, data, help, warn, error
  // (Levels from winston cli-config.js)

  logger.remove(logger.transports.Console);
  logger.add(logger.transports.Console, {
    // timestamp can simply be true, or a function that returns a string
    timestamp: true,
    colorize: true
  });
  switch(process.env.NODE_ENV) {
    case 'development':
      logger.level = 'debug';
      break;
    case 'test':
      logger.level = 'warn';
      break;
    case 'production':
      logger.level = 'info';
      break;
    default:
      logger.level = 'info';
  }
};

// Initialize the logger
initLogger();


// Create the server using app
var server = require('http').createServer(app);
// inject the routes into the app
require('./routes')(app);


// Create a proxy server that redirects WebSocket request directly to the Docker daemon.
var dockerProxy = httpProxy.createProxyServer({target: 'ws://' + config.docker.hostIP + ':' + config.docker.hostPort});

// Intercept upgrade events (from http to WS) and forward the to docker daemon
server.on('upgrade', function(req, socket, head) {
    logger.debug('Proxy server received "Upgrade Event"; Forwarding request to Docker WS.');
    dockerProxy.ws(req, socket, head);
    //if(req.url.indexOf('token=1234') !== -1) {
    //    apiProxy.ws(req, socket, head);
    //}
    //else {
    //    logger.info('No valid WS auth token');
    //    req.abort();
    //    //apiProxy.web()
    //}
});


// listen for errors thrown by the dockerProxy
dockerProxy.on('error', function (err) {
  logger.error('dockerProxy threw error: ');
  logger.error(err);
});


// Enable the Docker event stream watchdog; in our case: remove a container on its "died" event
if(config.monitor.removeDeadContainers) {
  docker.monitorEvents(1, 10, docker.removeContainer);
}

// Enable the monitoring of max number of processes per container
if(config.monitor.maxNumOfProcesses) {
  docker.monitorNProcPerContainer(config.monitor.maxNumOfProcessesInterval, config.monitor.maxNumOfProcessesLimit);
}


// Start server
server.listen(config.serverPort, config.ip, function () {
    logger.info('Mantra server listening on port %d, running in %s mode', config.serverPort, app.get('env'));
});

// Expose app
module.exports = app;
