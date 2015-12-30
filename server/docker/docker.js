/**
 * Created by hce on 05/08/15.
 *
 * A collection of functions to interact with the Docker Remote API.
 *
 */

"use strict";


var config = require('../config/env/index'),
  logger = require('winston'),
  Promise = require('bluebird'),
  request = Promise.promisify(require('request')),
  WebSocketClient = require('websocket').client;


/**
 * Function to create a new container.
 * @param {string} aContainerImage the name of the container image
 * @param {string} aCommand
 * @param {string} aWorkingDir
 * @param {boolean} aStreamIO should the IO of the container be stream via websocket? Given value affects the timeouts for the container.
 * @param {Object} aTimeoutSettings {cpu, session, sessionNoStream} an object that contains the timeout values that should be used for the container
 * @returns {bluebird} a Promise that resolves to an object {containerId, warnings, statusCode, msg} if a container was
 * created. Or a rejected Promise (which you need to catch) that resolves to {statusCode, msg} if there was a problem
 * while creating the container.
 */
var createContainer = function createContainer(aContainerImage, aCommand, aWorkingDir, aStreamIO, aTimeoutSettings) {

  // determine the timeout parameters that we need as arguments for the cobo-exec.sh script
  var timeoutCPUArg = aTimeoutSettings.cpu;
  var timeoutSessionArg = aStreamIO ? aTimeoutSettings.session : aTimeoutSettings.sessionNoStream;

  // create a string with the arguments for the cobo-exec.sh script
  var cmdArgs = '\'' + aCommand + '\' ' + timeoutCPUArg + ' ' + timeoutSessionArg;

  logger.debug('dockerjs.createContainer: creating container with cmdArgs: ' + cmdArgs);

  // the payload we send to the Docker RemoteAPI in order to create a new container
  var payload = {
    Hostname: 'cobo',
    AttachStdin: true,
    AttachStdout: true,
    AttachStderr: true,
    Cmd: ['sh', '-c', 'bash /home/cobo/cobo-exec.sh '+ cmdArgs +'; exit'], // use exit because otherwise "sh" will "run forever"
    Image: aContainerImage,
    WorkingDir: aWorkingDir,
    OpenStdin: true,
    Tty: true,
    NetworkDisabled: true,
    HostConfig: {
      Binds: [aWorkingDir + ':' + aWorkingDir],
      Ulimits: [{Name: 'nproc', Soft: config.docker.ulimitNProcSoft, Hard: config.docker.ulimitNProcHard}]
    }
  };

  // in development, when using Mac, we want to run the docker with root user
  // this is because otherwise Mantra needs to write files to disk also as "cobo" user (with same uid and gid)
  // that's too inconvenient for development
  // Note however: the default Docker files are using the cobo user. I.e. that Eiffel pre-compiles do not
  // exist for the root user but only the cobo user
  if (config.env === 'development') {
    payload.User = 'root';
  } else {
    payload.User = 'cobo';
  }


  // the settings for the request we send to the Docker API
  var options = {
    url: 'http://' + config.docker.hostIP + ':' + config.docker.hostPort + '/containers/create',
    json: payload,
    method: 'POST'
  };


  return request(options)
    .spread(function(response, body) {

      // if everything is ok, we return the containerId and possible Docker warnings
      if(response.statusCode === 201) {

        var successResult = {
          containerId: body.Id,
          warnings: body.warnings,
          statusCode: 201,
          msg: 'Creating new container - Docker API says: No error.'
        };

        // return a (implicit) Promise
        return successResult;
      }
      else {
        // Docker API replied with some error; create an error response accordingly
        var errResult = {
          statusCode: response.statusCode,
          msg: 'Error creating new container - Docker API returned an error with unknown statusCode.'
        };

        // update the errResult with a msg that reflects the statusCode
        switch (response.statusCode) {
          case 404:
            errResult.msg = 'Error creating new container - Docker API says: No such container.';
            break;
          case 406:
            errResult.msg = 'Error creating new container - Docker API says: Impossible to attach (container not running).';
            break;
          case 500:
            errResult.msg = 'Error creating new container - Docker API says: Server error.';
            break;
        }

        // return a rejected Promise
        return Promise.reject(errResult);
      }
    })
    .catch(function(err) {

      var errResult = {
        statusCode: 500,
        msg: 'Unknown error creating new container. Make sure the Docker demon is running.'
      };

      return Promise.reject(errResult);
    });
};


/**
 * Function to start a container
 * @param {string} aContainerId id of the container to start
 * @returns {bluebird} Promise
 */
var startContainer = function (aContainerId) {

  // the settings for the request we send to the Docker API
  var options = {
    url: 'http://' + config.docker.hostIP + ':' + config.docker.hostPort + '/containers/' + aContainerId + '/start',
    method: 'POST'
  };


  return request(options)
    .spread(function(response, body) {

      // if the container was started or is already running, we return a success-Object
      if(response.statusCode === 204 || response.statusCode === 304) {

        var successResult = {
          statusCode: response.statusCode,
          msg: 'Starting a container - Docker API successfully returned with unknown statusCode.'
        };

        switch (response.statusCode) {
          case 204:
            successResult.msg = 'Starting a container - Docker API says: No error.';
            break;
          case 304:
            successResult.msg = 'Starting a container - Docker API says: Container already started.'
            break;
        }

        return successResult;
      }
      else {

        // got some error code that's not a success code; create errResult object to return
        var errResult = {
          statusCode: response.statusCode,
          msg: 'Starting a container - Docker API returned an error with unknown statusCode.'
        };

        switch (response.statusCode) {
          case 404:
            errResult.msg = 'Starting a container - Docker API says: No such container.';
            break;
          case 500:
            errResult.msg = 'Starting a container - Docker API says: Server error.';
            break;
        }

        return Promise.reject(errResult);
      }
    })
    .catch(function(err) {

      var errResult = {
        statusCode: 500,
        msg: 'dockerjs.startContainer: Unknown error starting a container. Make sure the Docker demon is running.'
      };

      return Promise.reject(errResult);
    });
};


/**
 * Stop a container
 * @param {string} aContainerId id of the container to stop
 * @returns {bluebird} Promise
 */
var stopContainer = function (aContainerId, aWaitSecUntilKill) {

  // the settings for the request we send to the Docker API
  var options = {
    url: 'http://' + config.docker.hostIP + ':' + config.docker.hostPort + '/containers/' + aContainerId + '/stop',
    method: 'POST'
  };


  return request(options)
    .spread(function(response, body) {

      // if the container was started or is already running, we return a success-Object
      if(response.statusCode === 204 || response.statusCode === 304) {

        var successResult = {
          statusCode: response.statusCode,
          msg: 'Stopping a container - Docker API successfully returned with unknown statusCode.'
        };

        switch (response.statusCode) {
          case 204:
            successResult.msg = 'Stopping a container - Docker API says: No error.';
            break;
          case 304:
            successResult.msg = 'Stopping a container - Docker API says: Container already stopped.'
            break;
        }

        return successResult;
      }
      else {

        // got some error code that's not a success code; create errResult object to return
        var errResult = {
          statusCode: response.statusCode,
          msg: 'Stopping a container - Docker API returned an error with unknown statusCode.'
        };

        switch (response.statusCode) {
          case 404:
            errResult.msg = 'Stopping a container - Docker API says: No such container.';
            break;
          case 500:
            errResult.msg = 'Stopping a container - Docker API says: Server error.';
            break;
        }

        return Promise.reject(errResult);
      }
    })
    .catch(function(err) {

      var errResult = {
        statusCode: 500,
        msg: 'dockerjs.stopContainer: Unknown error stopping a container. Make sure the Docker demon is running.'
      };

      return Promise.reject(errResult);
    });
};


/**
 * Removes the container with the given container id.
 * @param {string} aContainerId the id of the container that should be removed
 * @param {boolean} [aForceRemoval=false] if true, kill and then remove the container
 * @returns {bluebird} a Promise that resolves to an object {statusCode, msg} if a container was
 * removed. Or a rejected Promise (which the caller needs to catch) that resolves to {statusCode, msg} if there was a problem
 * while removing the container.
 */
var removeContainer = function (aContainerId, aForceRemoval) {

  // check if aForceRemoval has been provided, otherwise set to false
  var lForceRemoval = aForceRemoval ? aForceRemoval : false;

  // the settings for the request we send to the Docker API
  var options = {
    url: 'http://' + config.docker.hostIP + ':' + config.docker.hostPort + '/containers/' + aContainerId + '?force=' + lForceRemoval,
    method: 'DELETE'
  };

  return request(options)
    .spread(function(response, body) {

      // if the container was removed, we return a success-Object
      if(response.statusCode === 204) {

        var successResult = {
          statusCode: response.statusCode,
          msg: 'Removing a container - Docker API says: no error.'
        };

        return successResult;
      }
      else {

        // got some error code that's not a success code; create errResult object to return
        var errResult = {
          statusCode: response.statusCode,
          msg: 'Removing a container - Docker API returned an error with unknown statusCode.'
        };

        switch (response.statusCode) {
          case 400:
            errResult.msg = 'Removing a container - Docker API says: Bad parameter.';
            break;
          case 404:
            errResult.msg = 'Removing a container - Docker API says: No such container.';
            break;
          case 500:
            errResult.msg = 'Removing a container - Docker API says: Server error.';
            break;
        }

        return Promise.reject(errResult);
      }
    })
    .catch(function(err) {

      var errResult = {
        statusCode: 500,
        msg: 'dockerjs.removeContainer: Unknown error removing a container. Make sure the Docker demon is running.'
      };

      return Promise.reject(errResult);
    });
};


/**
 * Attaches to a given container via Websocket. Start the containers and waits until the
 * WS connection closes. Saves all the output the container generates and finally returns it as part of a resolving
 * promise.
 * @param {number} aContainerId id of the container that should be run
 * @returns {bluebird} Promise that resolves to a String which is the output of running the container. If an error
 * occurs, the the Promise is rejected and a String with an error message is returned.
 */
var attachAndRunContainer = function attachAndRunContainer (aContainerId) {

  return new Promise(function (resolve, reject) {

    // create a websocket client
    var wsClient = new WebSocketClient();
    // construct the Websocket Uri
    var wsUri = 'ws://' + config.docker.hostIP + ':' + config.docker.hostPort + '/containers/' + aContainerId + '/attach/ws?logs=0&stream=1&stdout=1&stdin=0&stderr=1';

    logger.debug('dockerjs.attachAndRunContainer: websocket uri: ' + wsUri);


    wsClient.on('connect', function(connection) {
      logger.debug('dockerjs.attachAndRunContainer: WebSocket client connected');


      // variable to store the messages that we receive through the Websocket
      var stdOutput = '';

      connection.on('error', function(error) {


        // *IMPORTANT*: We have a problem that sometimes the WebSocket closes with an error. However, it seems all output was generated fine.
        // Because we have race condition with monitoring containers and automatically killing them, we'll ignore the error for now
        // and *pretend* that things worked ok. This is a work-around until we have a better solution.
        // A bug report has been filed here: https://github.com/theturtle32/WebSocket-Node/issues/150

        // The two lines below are the original, intended behavior:
        // logger.error('dockerjs.attachAndRunContainer: Websocket connection error: ' + error.toString());
        // reject(error.toString());

        // enable the following logging if you want to check the container output in case of a websocket error
        // logger.warn('dockerjs.attachAndRunContainer: Websocket connection error: ' + error.toString() + '; Ignoring this error for now. Container output being returned is:\n' + stdOutput + '\n');
        resolve(stdOutput);
      });
      connection.on('close', function() {
        logger.debug('dockerjs.attachAndRunContainer: Websocket connection closed');
        resolve(stdOutput);
      });
      connection.on('message', function(message) {
        if (message.type === 'utf8') {
          stdOutput += message.utf8Data;
        }
      });

      // start the container
      startContainer(aContainerId)
        .then(function(successResult) {
          logger.debug(successResult.statusCode + '; ' + successResult.msg);
        })
        .catch(function(errorResult) {
          logger.error(errorResult.statusCode + ';' + errorResult.msg);
        });
    });

    wsClient.on('connectFailed', function(errorDescription) {

      var l_errorDesc = 'error description not parsed yet';

      try {
        l_errorDesc = JSON.stringify(errorDescription);
      }
      catch(err) {
        logger.error('dockerjs.attachAndRunContainer - connectFailed Event: could not JSON.stringify the errorDescription')
      }

      logger.error('dockerjs.attachAndRunContainer - connectFailed Event: ' + l_errorDesc);
      reject(errorDescription);
    });

    // connect the client
    // first argument: the url of the container's websocket
    // second arg: could specify subprotocols supported by the client (not needed)
    // third arg: origin-policy, identifies where the ws request comes from (needed, otherwise Docker WS sends 403)
    wsClient.connect(wsUri, null, 'http://' + config.docker.hostIP + ':' + config.docker.hostPort);
  });
};


/**
 * Function that hooks into the Docker event stream.
 * Filters for the "die" event of containers and executes the callback aEventCallback for each such event.
 * @param {number} aNumReConnects counter to count how often the function tried to reconnect to the event stream.
 * Call this with value 1. The function restarts itself recursively if the connection to the event stream is lost.
 * @param {number} aMaxNumberReConnects maximum number of times the function should try to restart in case the connection
 * to the event stream was lost
 * @param {function(aContainerId)} aEventCallback a function that takes a containerId as argument. The function is called
 * when a "die" event was reported.
 */
var monitorEvents = function(aNumReConnects, aMaxNumberReConnects, aEventCallback) {

  // the settings for the request we send to the Docker API
  // we filter to only receive events when containers die; then, we'll run aEventCallback to e.g. remove the container
  var options = {
    url: 'http://' + config.docker.hostIP + ':' + config.docker.hostPort + '/events?filters={"event":["die"]}'
  };

  // Function to reconnect to the event stream. Waits for 5 sec before trying a reconnect
  var tryReconnect = function() {
    setTimeout(function(){
      logger.warn('dockerjs.monitorEvents: Trying to reconnect to Docker event stream');
      monitorEvents(aNumReConnects + 1, aMaxNumberReConnects, aEventCallback);
    }, 5000);
  };

  if (aNumReConnects < aMaxNumberReConnects) {
    request
      .get(options.url) // Note: in the following, we use request's capability to handle streaming
      .on('response', function(response) {
        logger.info('dockerjs.monitorEvents: connected to Docker event stream');
      })
      .on('data', function(data) {

        logger.debug('dockerjs.monitorEvents: Received event');
        logger.debug('dockerjs.monitorEvents: ' + data.toString());

        // call the eventCallback function with the container from the last event
        try {
          // try to parse the event data
          var eventData = JSON.parse(data.toString());

          // if we have event data and a container id, we call the callback with that id
          if(eventData && eventData.id) {
            aEventCallback(eventData.id)
              .then(function(response) {
                logger.debug('dockerjs.monitorEvent: event callback replied with status ' + response.statusCode);
              })
              .catch(function(err) {
                logger.error('dockerjs.monitorEvents: Error from Event Callback: ' + err.statusCode + ' - ' + err.msg);
              });
          }
        } catch(err) {
          logger.err("dockerjs.monitorEvents: can't parse event data into JSON;" + err);
        }

      })
      .on('end', function() {
        logger.warn("dockerjs.monitorEvents: Connection ended.");
        tryReconnect();
      }).on('error', function(err) {
        logger.error('dockerjs.monitorEvents: Error occurred connection to the event stream: ' + err);
        tryReconnect();
      });

  } else {
    logger.error("dockerjs.monitorEvents: Tried to reconnect to Docker Events for " + aMaxNumberReConnects + ' times. No success. Please check if Docker demon is running.');
  }
};


/**
 * Function that checks all active containers for the number of processes they run.
 * If a container has more than aMaxNProc processes, it will be terminated.
 * @param {number} aMaxNProc maximum number of processes a container may have
 * @private
 */
var _checkNProcPerContainer = function(aMaxNProc) {

  // Inner function that checks the nproc for one specific container
  // If the container aContainerId exceeds the aMaxNumOfProcs, the function will stop the container
  var checkContainer = function (aContainerId, aMaxNumOfProcs) {

    var options = {
      url: 'http://' + config.docker.hostIP + ':' + config.docker.hostPort + '/containers/' + aContainerId + '/top',
      method: 'GET'
    };

    request(options)
      .spread(function(response, body) {

        if(response.statusCode == 200) {
          var res = JSON.parse(body);

          logger.debug('dockerjs._checkNProcPerContainer: the processes in container ' + aContainerId);
          logger.debug(JSON.stringify(res.Processes));

          if (res.Processes && res.Processes.length > aMaxNumOfProcs) {
            logger.warn('dockerjs._checkNProcPerContainer: container ' + aContainerId + ' runs ' + res.Processes.length +
            ' processes, exceeding the limit of ' + aMaxNProc + '; will now stop it ' + aContainerId);

            // stop the container
            stopContainer(aContainerId)
              .then(function(successResult) {
                logger.debug('dockerjs._checkNProcPerContainer.checkContainer: Stopped container with too many processes')
              })
              .catch(function(errorResult) {
                logger.warn('dockerjs._checkNProcPerContainer.checkContainer: An error occured trying to stop a container');
              });
          }
        }
        else {
          // 404 -> no such container
          // 500 -> server error
          logger.warn('dockerjs._checkNProcPerContainer.checkContainer: tried to "top" a container ' +
            'but Docker daemon responded with ' + response.statusCode + ' status code.')
        }
      });
  };


  // get a list of all running containers
  var options = {
    url: 'http://' + config.docker.hostIP + ':' + config.docker.hostPort + '/containers/json',
    method: 'GET'
  };

  request(options)
    .spread(function(response, body) {

      // if the container was removed, we return a success-Object
      if(response.statusCode === 200) {

        var list = JSON.parse(body);
        // received an array with 0 or more containers
        logger.debug('dockerjs.monitorNProcPerContainer: received list of containers with length ' + list.length);

        for(var i = 0; i < list.length; i++) {
          logger.debug('dockerjs.monitorNProcPerContainer:' + list[i].Id);
          checkContainer(list[i].Id, aMaxNProc);
        }
      }
      else {
        logger.debug('dockerjs.monitorNProcPerContainer: no containers running');
      }
    })
    .catch(function(err) {
      logger.error('dockerjs.monitorNProcPerContainer: error fetching list of all running containers');
    });

};


/**
 * Checks the number of processes that run in every active container.
 * A check is performed every aCheckingInterval seconds. If a container has more than
 * aMaxNProc number of processes, the container is immediately terminated
 * @param aCheckingInterval {number} interval (sec) in which to check
 * @param aMaxNProc {number} max number of processes allowed in a container
 */
var monitorNProcPerContainer = function (aCheckingInterval, aMaxNProc) {

  _checkNProcPerContainer(aMaxNProc);

  setTimeout(monitorNProcPerContainer, aCheckingInterval * 1000, aCheckingInterval, aMaxNProc);
};


module.exports = {
  createContainer: createContainer,
  startContainer: startContainer,
  stopContainer: stopContainer,
  removeContainer: removeContainer,
  attachAndRunContainer: attachAndRunContainer,
  monitorEvents: monitorEvents,
  monitorNProcPerContainer: monitorNProcPerContainer
};
