/**
 * Created by hce on 08/07/15.
 *
 * Utility functions for Mantra.
 */



var CONST = require('./config/const.js'),
  config = require('./config/env'),
  path = require('path'),
  logger = require('winston'),
  Promise = require('bluebird'),
  fs = Promise.promisifyAll(require('fs')),
  mkdirp = Promise.promisify(require('mkdirp').mkdirp);


// fs.exists can't be promisified automatically; this is a workaround (see also: https://github.com/petkaantonov/bluebird/issues/418)
fs.existsAsync = function (aPath) {
  return new Promise(function (resolve, reject) {
    fs.exists(aPath, function(aExists) {
      resolve(aExists);
    });
  });
};


/**
 * Returns true if aAction represents the "compile" action.
 * Note: you should sanitize aAction before calling this function.
 * @param aAction {String} the action to check
 * @returns {boolean} true if aAction represents "compile"
 */
var isActionCompile = function (aAction) {
  return CONST.ACTION.COMPILE === aAction;
};


/**
 * Returns true if aAction represents the "run" action.
 * Note: you should sanitize aAction before calling this function.
 * @param aAction {String} the action to check
 * @returns {boolean} true if aAction represents "run"
 */
var isActionRun = function (aAction) {
  return CONST.ACTION.RUN === aAction;
};


/**
 * Returns true if aAction represents the "test" action.
 * Note: you should sanitize aAction before calling this function.
 * @param aAction {String} the action to check
 * @returns {boolean} true if aAction represents "test"
 */
var isActionTest = function (aAction) {
  return CONST.ACTION.TEST === aAction;
};


/**
 * Checks if a given action is supported by Mantra.
 * Note: you should sanitize aAction before calling this function.
 * @param {string} aAction
 * @returns {boolean}
 * @private
 */
var isSupportedAction = function (aAction) {

  var isValidAction = false;

  for(var property in CONST.ACTION) {
    if(CONST.ACTION.hasOwnProperty(property)) {
      if(CONST.ACTION[property] === aAction) {
        isValidAction = true;
      }
    }
  }

  return isValidAction;
};


/**
 * Returns a list of all actions supported by Mantra
 * @returns {string} list of actions
 * @private
 */
var getListOfValidActions = function () {
  var actions = '';

  for(var property in CONST.ACTION) {
    if(CONST.ACTION.hasOwnProperty(property)) {
      actions += ' ' + CONST.ACTION[property];
    }
  }
  return actions.trim();
};


/**
 * Give an action String, the function returns
 * a the string without preceding and trailing whitespaces and makes the string lowercase.
 * @param {string} aAction the string to sanitized
 * @returns {string} trimmed and lowercase string
 */
var getSanitizedAction = function getSanitizedAction(aAction) {
  return aAction.trim().toLowerCase();
};


/**
 * Returns a string that represents a random id.
 * @returns {String} a random id
 */
var getRandomId = function () {
  var id = '';
  for (var i = 0; i < 5; i++) {
    id = id + Math.random().toString(36).substring(5);
  }

  // add server name here; server name should be unique, e.g. "m0" for mantra0 instance
  return config.serverName + id;
};


/**
 * Returns a promise that shows if a MantraId is valid, i.e. it exists on the file system and is not
 * older than the maximum allowed age for a mantra id.
 * @param aMantraId {string} a mantra id
 * @returns {bluebird} Promise that always resolves to true or false, true if aMantraId is valid
 */
var isValidMantraId = function (aMantraId) {

  if (!aMantraId) {
    // check for null etc.
    return new Promise.resolve(false);
  }
  else {
    var fullPathOfMantraId = path.join(config.mantraPath, aMantraId);

    return fs.existsAsync(fullPathOfMantraId)
      .then(function (aExists) {

        if (aExists) {
          return fs.statAsync(fullPathOfMantraId);
        }
        else {
          // jump into the catch block
          return Promise.reject('Invalid MantraId');
        }
      })
      .then(function (stats) {

        // the mantraId folder exists but we must check that it's not too old yet
        var idStillFresh = false;

        if (stats && stats.mtime) {
          var now = new Date();
          var seconds = (Math.abs(now - stats.mtime) / 1000); // number of seconds since last modified
          if (seconds <= config.maxLifeTimeForMantraId) {
            idStillFresh = true;
          }
        }

        return idStillFresh;
      })
      .catch(function (err) {
        return false;
      });
  }
};


// Recursive implementation of a while loop that runs until a valid MantraId was generated.
var promiseWhile = function promiseWhile(aFnToCreateANewMantraId, aFnToTestIfMantraIdIsValid) {

  var newMantraId = aFnToCreateANewMantraId();

  return aFnToTestIfMantraIdIsValid(newMantraId)
    .then(function(isValid) {
      if (!isValid) {
        return Promise.resolve(newMantraId);
      }
      else {
        return promiseWhile(aFnToCreateANewMantraId, aFnToTestIfMantraIdIsValid);
      }
    });
};


/**
 *
 * @param req the request object (needed to access the request params)
 */
var getNewMantraId = function () {

  // Run a promise-while loop that generates new mantraId's until we have a valid new MantraId.
  // A new MantraId might be invalid if a folder with the same name already exists.
  // Changes of that a small, so in most cases with loop will only run a single iteration.
  return promiseWhile(getRandomId, isValidMantraId).then(function(newMantraId) {
    return newMantraId;
  });
};


/**
 * Takes an array of files and returns a string with all the filenames
 * that match the given fileExtension. Every filename in the string is
 * prefixed with "./"
 * @param {File[]} aFiles array of files where each file is an of type {"filename": String, "content": String}
 * @param {string} aFileExtension  a file extension, e.g. ".java"
 * @returns {string} single string that contains all matching filenames
 */
var getListOfFilenames = function (aFiles, aFileExtension) {

  var strOfFilenames = '';

  if (aFiles) {
    for (var i = 0; i < aFiles.length; i++) {
      var filename = aFiles[i].filename;
      if (filename.indexOf(aFileExtension, filename.length - aFileExtension.length) !== -1) {
        strOfFilenames = strOfFilenames + ' ./' + filename;
      }
    }
  }

  return strOfFilenames.trim();
};


/**
 * Takes an array of files and returns a JSON object that represents the
 * codeboard.json file.
 * @param {File[]} aFiles array of files
 * @param {string} [aCodeboardConfigName=codeboard.json] optional name of the config file, default is 'codeboard.json'
 * @returns {Object} the codeboard.json object; null if the config can not be found
 */
var getCodeboardConfigObject = function(aFiles, aCodeboardConfigName) {

  if(!(aCodeboardConfigName)){
    aCodeboardConfigName = 'codeboard.json';
  }

  // helper function: given a path like Root/codeboard.json, returns codeboard.json
  var getFileNameFromPathName = function (aPathName) {
    var parts = aPathName.split('/');
    return parts[parts.length - 1];
  };


  // variable to return the config object
  var configObject = null;

  // iterate over all files and find the file that matches the config filename
  if (aFiles) {
    for (var i = 0; i < aFiles.length; i++) {
      if(aCodeboardConfigName === getFileNameFromPathName(aFiles[i].filename)){
        configObject = aFiles[i];
      }
    }
  }

  // return the config object
  return configObject;
};


/**
 * Get the codeboard.json file from disk. It should be stored under the Root
 * folder of the given MantraId (which is also a folder on disk).
 * NOTE: this function is only meant to be use until the payload contains the
 * coboConfigObject (codeboard.json) directly. At that point, there's no need
 * get the file from disk anymore.
 * @param {string} aMantraId a valid mantraId
 * @returns {bluebird} a Promise that resolves to the Cobo Config object (a rejected Promise)
 */
var getCodeboardConfigObjectFromDisk = function(aMantraId) {
  var coboFilePath = path.join(config.mantraPath, aMantraId, 'Root', 'codeboard.json');
  logger.debug('util.getCodeboardConfigObjectFromDisk: using file path: ' + coboFilePath);

  return fs.readFileAsync(coboFilePath)
    .then(function(file){
      return JSON.parse(file.toString());
    })
    .catch(function(err) {
      logger.warn('util.js Error: can not find codeboard.json file on disk for given MantraId');
      return Promise.reject();
    });
};


/**
 * Writes an array of files 'aFiles' to disk at the location of 'aPath'. If needed folders
 * of a file don't exist, the function will create them.
 * @param {Array} aFiles array of file objects where a file has properties {filename, content}
 * @param {string} aPath path were the files should be stored
 * @returns {bluebird} a Promise that resolves once all files have been written successfully.
 */
var writeFilesToDisk = function (aFiles, aPath) {

  /* the promises is an array of promises */
  var promises = [];

  for (var i = 0; i < aFiles.length; i++) {

    // create a new promise for the creation of the file
    var p = new Promise(function (resolve, reject) {

      var filename = aFiles[i].filename;
      var content = aFiles[i].content;

      // the full path, including the filename
      var filePath = path.join(aPath, filename);
      // the path of directories, without the filename
      var dirPathOfFile = path.dirname(filePath);


      fs.existsAsync(dirPathOfFile)
        .then(function(exists) {

          if(!exists) {
            return mkdirp(dirPathOfFile);
          }
          else {
            // we returns an "empty" promise that immediately resolves; allows us to follow the then-chain
            return Promise.resolve();
          }

        })
        .then(function() {
          // write the file

          return fs.writeFileAsync(filePath, content);

        })
        .then(function() {
          // resolve the promise p
          resolve();
        })
        .catch(function(err) {
          logger.error('utiljs.writeFilesToDisk: Error writing file: ' + err);
          reject();
        });
    });
    promises.push(p); // store the promise
  }

  return Promise.all(promises);
};


module.exports = {
  isActionCompile: isActionCompile,
  isActionRun: isActionRun,
  isActionTest: isActionTest,
  isSupportedAction: isSupportedAction,
  getListOfValidActions: getListOfValidActions,
  getSanitizedAction: getSanitizedAction,
  getRandomId: getRandomId,
  isValidMantraId: isValidMantraId,
  getNewMantraId: getNewMantraId,
  getListOfFilenames: getListOfFilenames,
  getCodeboardConfigObject: getCodeboardConfigObject,
  getCodeboardConfigObjectFromDisk: getCodeboardConfigObjectFromDisk,
  writeFilesToDisk: writeFilesToDisk
}