'use strict';

var path = require('path'),
  _ = require('lodash');


function requiredProcessEnv(name) {
  if(!process.env[name]) {
    throw new Error('You must set the ' + name + ' environment variable');
  }
  return process.env[name];
}

/**
 * Function to convert a string into a boolean. Returns true for strings
 * like 'true' or 'True' or 'TRUE'. Returns false otherwise.
 * @param aString {string} the string to convert.
 * @returns {*|boolean} returns true for a truthy string, otherwise false
 */
function stringToBool(aString) {
  return aString && aString.toLowerCase() === 'true';
}


/**
 * Function to convert a string into a number.
 * @param aString {string} the string to convert to a number.
 * @returns {number} returns a number if aNumber is valid, otherwise returns null
 */
function stringToNumber(aNumber) {
  if (!aNumber)
    return null;
  else
    return parseInt(aNumber, 10);
}

// All configurations will extend these options
// ============================================
var all = {
  env: process.env.NODE_ENV || 'development',

  // Root path of server
  root: path.normalize(__dirname + '/../../..'),

  // Server IP
  serverIP: process.env.SERVER_IP || '127.0.0.1',

  // Server port
  serverPort: process.env.PORT || 9090,

  // Name of the mantra server
  // should be a unique identifier for the case of multiple mantra instances running on the same machine
  // e.g. for three instances use: m0, m1, m2
  serverName: process.env.SERVER_NAME || 'm0',

  // the path where Mantra should store a project's files (e.g. source code files)
  mantraPath: process.env.MANTRA_PATH || '/tmp/projects',

  // the maximum valid life time of a mantra id (in seconds)
  maxLifeTimeForMantraId: 1800,

  // configuration of the Docker Remote API
  docker: {
    // the Url of the Docker Remote API
    hostIP: process.env.DockerHostUrl || "127.0.0.1",
    // the port of the Docker Remote API
    hostPort: process.env.DockerHostPort || "4243",

    // set the ulimit for number of processes that a container can run
    // (Note: nproc limit is shared between all containers running with the same user)
    ulimitNProcSoft: process.env.DockerUlimitNProcSoft || 1024,
    ulimitNProcHard: process.env.DockerUlimitNProcHard || 1536
  },

  cookie: {
    // should each response contain a set-cookie header
    setCookie: stringToBool(process.env.COOKIE_SET) || true,

    // the name of the cookie
    name: process.env.COOKIE_NAME || 'CoboMantraId'
  },

  // configuration for monitor functionality
  monitor: {

    // monitor the Docker event stream and kill any container that shows up in an (event type: die) event
    removeDeadContainers: stringToBool(process.env.MONITOR_REMOVE_DEAD_CONTAINER) || false,

    // monitor the number of processes running in each container
    maxNumOfProcesses: stringToBool(process.env.MONITOR_MAX_NPROC) || false,
    // the interval (secs) in which to check the number of processes in each container
    maxNumOfProcessesInterval: stringToNumber(process.env.MONITOR_MAX_NPROC_INTERVAL) || 15,
    // the max. number of processes allowed to run in a container
    maxNumOfProcessesLimit: stringToNumber(process.env.MONITOR_MAX_NPROC_LIMIT) || 100
  }

};


// Export the config object based on the NODE_ENV
// ==============================================
module.exports = _.merge(
  all,
  require('./' + (process.env.NODE_ENV || 'development') + '.js') || {});
