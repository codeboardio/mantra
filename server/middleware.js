/**
 * Express middleware functions to check the payload.
 *
 * Created by hce on 16/07/15.
 */

'use strict';


var languages = require('./languages/index.js'),
  docker = require('./docker/docker.js'),
  util = require('./util.js'),
  config = require('./config/env/index.js'),
  logger = require('winston'),
  path = require('path'),
  CONST = require('./config/const.js'),
  WebSocketClient = require('websocket').client;


/**
 * Adds a object named "mantra" to the req object.
 * The different middleware functions will add more properties to the mantra object.
 * @param req request
 * @param res response
 * @param next next
 */
var createMantraReqObject = function (req, res, next) {
  req.mantra = {
    // by default the streaming option is enabled
    stream: true
  };
  next();
};


/**
 * Checks if the request has one of the supported actions.
 * Actions are listed in config/const.js
 * @param req request
 * @param res response
 * @param next next
 */
var verifyAction = function (req, res, next) {

  // get the action property of the payload
  var lAction = req.body.action;

  if (lAction) {
    lAction = util.getSanitizedAction(lAction);
  }

  // check the action
  if (!(lAction) || !(util.isSupportedAction(lAction))){
    res.status(400).json(
      {msg:
        'Invalid action. ' +
        'Make sure to provide a valid action as part of the payload. Valid actions are: ' +
        util.getListOfValidActions()
      });
  } else {
    // store the sanitized action in the mantra object of the request
    req.mantra.action = lAction;
    // invoke next middleware
    next();
  }
};


var verifyActionIsRunElseNR = function verifyActionIsRun(req, res, next) {
  if (util.isActionRun(req.mantra.action)) {
    next();
  }
  else {
    next('route');
  }
};


var verifyActionIsCompileElseNR = function verifyActionIsCompile (req, res, next) {
  if (util.isActionCompile(req.mantra.action)) {
    next();
  }
  else {
    next('route');
  }
};


/**
 * Verifies that the action on the request object is a "test" action;
 * if not, sends a 400 error.
 * Assumes: req.mantra.action has a sanitized action
 * @param req
 * @param res
 * @param next
 */
var verifyActionIsTest = function verifyActionIsTest (req, res, next) {
  if (util.isActionTest(req.mantra.action)) {
    next();
  }
  else {
    res.status(400).json(
      {msg:
      'Invalid action. ' +
      'Make sure to provide a "test" action as part of the payload.'
      });
  }
};

/**
 * Middleware function to validate that a language is provided as part of the
 * requests body and that the language is supported.
 * Adds property req.mantra.language with a sanitized version of the language.
 * @param req request
 * @param res response
 * @param next next
 */
var verifyLanguage = function (req, res, next) {

  // get the action property of the payload
  var lLanguage = req.body.language;

  // sanitize language
  if(lLanguage) {
    lLanguage = languages.getSanitizedLanguage(lLanguage);
  }

  // check the language
  if (!(lLanguage) || !(languages.isLanguageSupported(lLanguage))){
    res.status(400).json(
      {msg:
      'Invalid language. ' +
      'Make sure to provide a valid language as part of the payload. Valid languages are: ' +
      languages.getListOfValidLanguages()
      });
  } else {
    req.mantra.language = lLanguage;
    next();
  }
};


/**
 * Middleware function to check if a language has support for the "test" action.
 * Assumes: req.mantra.language exists.
 * @param req
 * @param res
 * @param next
 */
var verifyLanguageSupportsTestAction = function verifyLanguageSupportsTestAction (req, res, next) {

  if (req.mantra && req.mantra.language && languages.isLanguageWithTestSupport(req.mantra.language)) {
    next();
  } else {
    res.status(400).json(
      {msg:
      'Invalid language for "test" action. ' +
      'Make sure to provide a language which supports testing.'
      });
  }
};


/**
 * Middleware function to get the codeboard config object (usually in the form of a codeboard.json).
 * Assumes: req.mantra.language exists (and holds a sanitized version of the language)
 * @param req request
 * @param res response
 * @param next next
 */
var verifyConfig = function verifyConfig (req, res, next) {

  // TODO: verify that the config object is okay, according to the language files
  // this assumes we already checked that the language is valid (should be at req.mantra.language)

  // TODO: The codeboard.json should be part of the payload, not hidden withing the files[] array.
  // For now, we try to extract it, but in the future, we can remove this code and simply take it
  // from the payload


  var coboConfig = '';

  if(languages.isCodeboardConfigRequired(req.mantra.language)) {

    // yes, a config is required, so we need to extract it

    if(req.body && req.body.files) {

      // extract it from the payload

      coboConfig = util.getCodeboardConfigObject(req.body.files);

      if(coboConfig === null) {
        logger.debug('middlewarejs.verifyConfig: can not find coboConfig file');
        res.status(400).json({msg: 'The provided files are missing the Codeboard configuration file (codeboard.json).'});
      }
      else {
        logger.debug('middlewarejs.verifyConfig: found coboConfig, printing the coboConfig content:');
        logger.debug(coboConfig);

        // try to parse the coboConfig (should be a valid JSON string)
        try {
          req.mantra.codeboardConfig = JSON.parse(coboConfig.content);
          next();
        } catch(err) {
          logger.debug('middlewarejs.verifyConfig: can not JSON.parse the coboConfig');
          res.status(400).json({msg: 'The provided Codeboard configuration (codeboard.json) violates the JSON format.'});
        }
      }
    }
    else if (req.params.mantraId) {

      // extract it from disk (the mantraId folder)

      util.isValidMantraId(req.params.mantraId)
        .then(function(isValid) {
          if (isValid) {

            util.getCodeboardConfigObjectFromDisk(req.params.mantraId)
              .then(function(aCodeboardConfig) {
                req.mantra.codeboardConfig = aCodeboardConfig;
                next();
              })
              .catch(function(err) {
                // could not read the coboConfig from disk
                res.status(500).json({msg: 'Can not find codeboard.json stored on disk but need it'})
              });
          }
          else {
            res.status(404).json({
              msg: 'The id ' + req.params.mantraId + ' is not valid. Try compiling your project and then execute this request again.'
            });
          }
        });
    }
  }
  else {
    // no config is required, so we just continue on
    req.mantra.codeboardConfig = coboConfig; // empty string
    next();
  }
};


/**
 * Middleware function to check if the request payload has an array files[].
 * Calls next() if it does, otherwise sends an error response.
 * @param req request
 * @param res response
 * @param next next
 */
var verifyFiles = function verifyFiles (req, res, next) {
  if (req.body && req.body.files && Array.isArray(req.body.files)) {
    req.mantra.files = req.body.files;
    next();
  }
  else {
    res.status(400).json({msg: 'Request does not contain valid files. Make sure to send an array of files as' +
    'part of the payload.'});
  }
};


/**
 * Middleware function to check if the request payload has an array testFiles[].
 * Calls next() if it does, otherwise sends an error response.
 * @param req request
 * @param res response
 * @param next next
 */
var verifyTestFiles = function verifyTestFiles (req, res, next) {
  if (req.body && req.body.files && Array.isArray(req.body.testFiles)) {
    req.mantra.testFiles = req.body.testFiles;
    next();
  }
  else {
    res.status(400).json({msg: 'Request does not contain valid test files. Make sure to send an array of test files as' +
    'part of the payload.'});
  }
};


/**
 * Middleware function to check if a Urls :mantraId is valid.
 * This function is only used if the action is NOT "compile" and the language is not a
 * dynamic language.
 * @param req
 * @param res
 * @param next
 */
var verifyMantraId = function(req, res, next) {

  var mantraId = req.params.mantraId;

  util.isValidMantraId(mantraId).then(function(isValid) {

    if(isValid) {
      req.mantra.mantraId = mantraId;
      next();
    }
    else {
      res.status(404).json({
        msg: 'The id ' + mantraId + ' is not valid. Try compiling your project and then execute this request again.'
      });
    }
  });
};


/**
 * Middleware function to write files to disk.
 * Takes mantraId from the Url parameter :mantraId
 * Checks if the mantraId is valid: if yes, uses it to store the files under mantraId, otherwise creates a new mantraId.
 * Calls next() if storing succeeds, otherwise sends a 500 error response.
 *
 * Assumes: files to write are available at req.mantra.files
 * Ensures: If next() is called, the used mantraId is available at req.mantra.mantraId
 * @param req request
 * @param res response
 * @param next next
 */
var writeFilesToDisk = function(req, res, next) {

  var lFiles = req.mantra.files;
  var lMantraId = req.params.mantraId;

  util.isValidMantraId(lMantraId).then(function(isValid) {
      if (isValid) {
        return lMantraId;
      }
      else {
        return util.getNewMantraId();
      }
    })
    .then(function(mantraId) {
      // make the mantraId available for other middleware
      req.mantra.mantraId = mantraId;
      return util.writeFilesToDisk(lFiles, path.join(config.mantraPath, mantraId));
    })
    .then(function() {
      next();
    })
    .catch(function(err) {
      logger.error('middlewarejs.writeFilesToDisk: Error writing files: ' + err);
      res.status(500).json({msg: 'Error while storing your files. Please try again.'});
    });
};


/**
 * Middleware function to write test files to disk.
 * Takes mantraId from rßeq.mantra.mantraId
 * Checks if the mantraId is valid: if yes, uses it to store the files under mantraId, otherwise throws an error.
 * Calls next() if storing succeeds, otherwise sends a 500 error response.
 *
 * Assumes: files to write are available at req.mantra.testFiles
 * Assumes: req.mantra.mantraId exists (and should have a valid mantraId, but the function will also check for that)
 * @param req request
 * @param res response
 * @param next next
 */
var writeTestFilesToDisk = function writeTestFilesToDisk (req, res, next) {

  var lTestFiles = req.mantra.testFiles;
  var lMantraId = req.mantra.mantraId;

  util.isValidMantraId(lMantraId).then(function(isValid) {
    if (isValid) {
      return lMantraId;
    }
    else {
      return Promise.reject('Invalid MantraId');
    }
  })
    .then(function() {
      // store the testFiles to disk
      return util.writeFilesToDisk(lTestFiles, path.join(config.mantraPath, lMantraId));
    })
    .then(function() {
      next();
    })
    .catch(function(err) {
      logger.error('middlewarejs.writeTestFilesToDisk: Error writing test files: ' + err);
      res.status(500).json({msg: 'Error while storing your test files. Please try again.'});
    });
};


/**
 * Assumes: req.mantra.language is set
 * @param req request
 * @param res response
 * @param next next
 */
var getCmdForCompileAction = function getCmdForCompileAction (req, res, next) {

  var cmd = languages.getCommandForCompileAction(req.mantra.language, req.mantra.codeboardConfig, req.mantra.files);

  req.mantra.command = cmd;

  next();

};


/**
 *
 * @param req request
 * @param res response
 * @param next next
 */
var getRunCommand = function getRunCommand (req, res, next) {

  var cmd = languages.getCommandForRunAction(req.mantra.language, req.mantra.codeboardConfig);

  req.mantra.command = cmd;

  next();

};


/**
 * Returns the command for a test action.
 *
 * Assumes: req.mantra.language exists
 * Assumes: req.mantra.codeboardConfig exits
 * Assumes: req.mantra.files exits
 * Assumes: req.mantra.testFiles exists
 * @param req
 * @param res
 * @param next
 */
var getCmdForTestAction = function getCmdForTestAction (req, res, next) {
  var cmd = languages.getCommandForTestAction(req.mantra.language, req.mantra.codeboardConfig, req.mantra.files, req.mantra.testFiles);
  req.mantra.command = cmd;
  next();
}


/**
 * Middleware function to set a header 'Set-Cookie' with the name
 * defined in config.cookie.name and the value req.mantra.mantraId.
 * The header will only be set if config.cookie.setCookie is true.
 * Assumes: req.mantra.mantraId is set
 * Ensures: if a cookie should be set, the cookie name equals config.cookie.setCookie
 * and the value equals req.mantra.mantraId
 * @param req request
 * @param res response
 * @param next next
 */
var setCookie = function setCookie (req, res, next) {

  if (config.cookie.setCookie) {
    res.cookie(config.cookie.name, req.mantra.mantraId);
  }
  next();
};


var createContainer = function createContainer (req, res, next) {


  var imageName = languages.getLanguageProperties(req.mantra.language).dockerImage;
  var timeoutSettings = languages.getLanguageProperties(req.mantra.language).timeoutSettings;

  var relativeDir = languages.getLanguageProperties(req.mantra.language).dockerWorkingDirRel;
  var mantraDir = path.join(config.mantraPath, req.mantra.mantraId, relativeDir);

  // check if the container's IO should be streamed via Websocket (if not we must attach to the container on the server)
  req.mantra.stream = (req.body.stream == undefined || req.body.stream);

  logger.debug('middlewarejs.createContainer: Streaming option: ' + req.mantra.stream);

  docker.createContainer(imageName, req.mantra.command, mantraDir, req.mantra.stream, timeoutSettings)
    .then(function(successResult) {

      // add the details about the Websocket Url and the Url to start the container on the mantra object
      req.mantra.containerId = successResult.containerId;

      // call next middleware
      next();

    })
    .catch(function(errResult) {
      // something went wrong trying to create the container
      res.status(errResult.statusCode).json({msg: errResult.msg});
    });
};


/**
 * Assumes: the :mantraId has been validated and is available at req.mantra.mantraId
 * @param req
 * @param res
 * @param next
 */
var startContainer = function startContainer (req, res, next) {

  // get the mantraId from the mantra object, it was processed in mw.verifyMantraId
  var mantraId = req.mantra.mantraId;
  // get the containerId form the Url
  var containerId = req.params.containerId;

  // start the container
  docker.startContainer(containerId)
    .then(function(successResult) {
      res.status(successResult.statusCode).json({msg: successResult.msg});
    })
    .catch(function(errResult) {
      res.status(errResult.statusCode).json({msg: errResult.msg});
    });
};


/**
 * Assumes: the :mantraId has been validated and is available at req.mantra.mantraId
 * @param req
 * @param res
 * @param next
 */
var stopContainer = function stopContainer (req, res, next) {

  // get the containerId form the Url
  var containerId = req.params.containerId;

  // start the container
  docker.stopContainer(containerId)
    .then(function(successResult) {
      res.status(successResult.statusCode).json({msg: successResult.msg});
    })
    .catch(function(errResult) {
      res.status(errResult.statusCode).json({msg: errResult.msg});
    });
};


/**
 * A middleware function to handle the "stream" option of a mantra request.
 * If "stream=false" this function sends a response how to attach to the container and how to start it.
 * If "stream=true" this function will run the container and return the output of the container as part of the response.
 * Assumes: existence of req.mantra.mantraId, req.mantra.containerId, req.mantra.stream
 * @param req
 * @param res
 * @param next
 */
var handleStreamOption = function handleStreamOption (req, res, next) {

  if (!(req.mantra.stream)) {

    docker.attachAndRunContainer(req.mantra.containerId)
      .then(function (stdOutput) {

        var resultPayload = {
          id: req.mantra.mantraId,
          output: stdOutput,
          stream: false
        };

        // if the action was compile, the result should have property "compilationError"
        if (util.isActionCompile(req.mantra.action)) {
          resultPayload.compilationError = languages.hasCompilationErrors(req.mantra.language, stdOutput);
        }

        res.status(200).json(resultPayload);
      })
      .catch(function (err) {
        logger.error(err);
        res.status(500).json({msg: 'Error while trying to attach and run the container.'});
      });
  }
  else {
    // send response that contains tha WS Url and start Url
    res.status(201).json({
      id: req.mantra.mantraId,
      stream: {
        url: 'ws://' + config.serverIP + ':' + config.serverPort + '/containers/' + req.mantra.containerId + '/attach/ws?stream=1&stdin=1&stdout=1&stderr=1',
        protocol: 'ws:',
        method: 'GET',
        hostname: config.serverIP,
        host: config.serverIP + ':' + config.serverPort,
        port: config.serverPort,
        pathname: '/containers/' + req.mantra.containerId + '/attach/ws',
        search: '?stream=1&stdin=1&stdout=1&stderr=1'
      },
      start: {
        url: 'http://' + config.serverIP + ':' + config.serverPort + '/' + req.mantra.mantraId + '/' + req.mantra.containerId + '/start',
        protocol: 'http:',
        method: 'POST',
        hostname: config.serverIP,
        host: config.serverIP + ':' + config.serverPort,
        port: config.serverPort,
        pathname: '/' + req.mantra.mantraId + '/' + req.mantra.containerId + '/start',
        search: ''
      },
      stop: {
        url: 'http://' + config.serverIP + ':' + config.serverPort + '/' + req.mantra.mantraId + '/' + req.mantra.containerId + '/stop',
        protocol: 'http:',
        method: 'POST',
        hostname: config.serverIP,
        host: config.serverIP + ':' + config.serverPort,
        port: config.serverPort,
        pathname: '/' + req.mantra.mantraId + '/' + req.mantra.containerId + '/stop',
        search: ''
      }
    });
  }
};


/**
 * Executes a container, then calls the parsing function to analyze the test output.
 *
 * Assumes: req.mantra.mantraId
 * Assumes: req.mantra.containerId
 * Assumes: req.mantra.language
 * Assumes:
 * @param req
 * @param res
 * @param next
 */
var executeAndAnalyzeTestContainer = function executeAndAnalyzeTestContainer (req, res, next) {

  docker.attachAndRunContainer(req.mantra.containerId)
    .then(function (stdOutput) {

      // result payload with default values
      var resultPayload = {
        id: req.mantra.mantraId,
        output: stdOutput,
        compilationError: false,
        numOfTestsPassing: -1,
        numOfTestsFailing: -1,
        stream: false
      };

      // parse the output to find if there was a compilation error; if not, how many test passed or failed
      var parseResult = languages.parseTestOutput(req.mantra.language, stdOutput);
      resultPayload.compilationError = parseResult.compilationError;
      resultPayload.numOfTestsPassing = parseResult.numOfTestsPassing;
      resultPayload.numOfTestsFailing = parseResult.numOfTestsFailing;

      res.status(200).json(resultPayload);
    })
    .catch(function (err) {
      logger.error(err);
      res.status(500).json({msg: 'Error while trying to attach and run the container for the "test" action.'});
    });
};


/**
 * Middleware function that checks if the language is a dynamic language and has files in the request payload.
 * If that's the case, next('route') is called. Otherwise, an ordinary
 * next() is called.
 * Assumes: req.mantra && req.mantra.language are set.
 * @param req request
 * @param res response
 * @param next next
 */
var handleDynamicLanguageNR = function handleDynamicLanguageNR (req, res, next) {
  if (req.mantra && req.mantra.language && languages.isDynamicLanguage(req.mantra.language) && req.body && req.body.files) {

    // rewrite the action (which might be 'run' or 'compile') to be compile
    req.body.action = CONST.ACTION.COMPILE;
    // move the next route that handles the 'compile' command
    next('route');
  } else {
    next();
  }
};


/**
 * Function that does nothing more then calling next('route');
 * @param req request
 * @param res response
 * @param next next
 */
var newRoute = function nextRoute(req, res, next) {
  next('route');
};


module.exports = {
  createMantraReqObject: createMantraReqObject,
  verifyAction: verifyAction,
  verifyActionIsRunElseNR: verifyActionIsRunElseNR,
  verifyActionIsCompileElseNR: verifyActionIsCompileElseNR,
  verifyActionIsTest: verifyActionIsTest,
  verifyLanguage: verifyLanguage,
  verifyLanguageSupportsTestAction: verifyLanguageSupportsTestAction,
  verifyConfig: verifyConfig,
  verifyFiles: verifyFiles,
  verifyTestFiles: verifyTestFiles,
  verifyMantraId: verifyMantraId,
  writeFilesToDisk: writeFilesToDisk,
  writeTestFilesToDisk: writeTestFilesToDisk,
  getCmdForCompileAction: getCmdForCompileAction,
  getRunCommand: getRunCommand,
  getCmdForTestAction: getCmdForTestAction,
  setCookie: setCookie,
  createContainer: createContainer,
  startContainer: startContainer,
  stopContainer: stopContainer,
  handleStreamOption: handleStreamOption,
  executeAndAnalyzeTestContainer: executeAndAnalyzeTestContainer,
  handleDynamicLanguageNR: handleDynamicLanguageNR,
  nextRoute: newRoute
};
