/**
 * Created by hce on 08/07/15.
 */

'use strict';

var CONST = require('../config/const.js'),
  logger = require('winston');


// Array that lists all supported languages and their property files
var languages = [
  {
    name: CONST.LANGUAGE_NAME.C,
    propertyFile: 'c.js'
  },
  {
    name: CONST.LANGUAGE_NAME.CPP,
    propertyFile: 'cpp.js'
  },
  {
    name: CONST.LANGUAGE_NAME.HASKELL,
    propertyFile: 'haskell.js'
  },
  {
    name: CONST.LANGUAGE_NAME.HASKELL_HSPEC,
    propertyFile: 'haskell-hspec.js'
  },
  {
    name: CONST.LANGUAGE_NAME.JAVA,
    propertyFile: 'java.js'
  },
  {
    name: CONST.LANGUAGE_NAME.JAVA_JUNIT,
    propertyFile: 'java-junit.js'
  },
  {
    name: CONST.LANGUAGE_NAME.PYTHON,
    propertyFile: 'python.js'
  },
  {
    name: CONST.LANGUAGE_NAME.PYTHON_UNIT_TEST,
    propertyFile: 'python-unittest.js'
  }
];

// object that we populate with properties that
var languageProperties = {};

// we run this function to initiate the the languageProperties object
// Note: the function call () after the declaration
var initiatePropertyFiles = function() {
  for(var i = 0; i < languages.length; i++) {

    // variable for the property file
    var prop = null;

    try {
      prop = require('./' + languages[i].propertyFile);
    }
    catch (err) {
      // TODO: use a logger here
      logger.warn('languagejs.initiatePropertyFiles: property file for language ' + languages[i].name + ' was not found.');
    }

    if (prop) {
      languageProperties[languages[i].name] = prop;
    }
  }
}();



var isDynamicLanguage= function (aLangugae) {
  return languageProperties[aLangugae].isDynamicLanguage;
};


/**
 * Returns true if given language supports test action.
 * @param aLangugae {String} a language
 * @returns {boolean} true if test action is supported by language, otherwise false.
 */
var isLanguageWithTestSupport = function (aLanguage) {
  return languageProperties[aLanguage].isLanguageWithTestSupport;
};


// Function returns true if aLanguage is a supported language
var isLanguageSupported = function (aLanguage) {

  var lIsSupported = false;

  if (languageProperties[aLanguage]) {
    lIsSupported = true;
  }

  return lIsSupported;
};


/**
 * Returns a string that lists all the supported languages.
 * @returns {string}
 */
var getListOfValidLanguages = function () {
  var list = '';
  for (var i = 0; i < languages.length; i++) {
    list += ' ' + languages[i].name;
  }
  return list.trim();
};


var getSanitizedLanguage = function (aLanguage) {

  var sanitzedLang = '';
  for (var i = 0; i < languages.length; i++) {
    if (aLanguage.trim().toLowerCase() === languages[i].name.trim().toLowerCase()) {
      sanitzedLang = languages[i].name;
    }

  }
  return sanitzedLang;
};



// function returns
var getProjectProperties = function (aLanguage) {

  if(aLanguage.toLowerCase().indexOf(languages) !== -1) {


    return ;
  }

};


/**
 * Assumes: aLanguage is a valid language and has been sanitized
 *
 * @param {string} aLanguage the language for which to get the command
 * @param {object} aCodeboardConfig the codeboard config (e.g. codeboard.json) file
 * @param {file[]} aFiles array of the files to compile (sometimes needed to generate the command)
 * @return
 */
var getCommandForCompileAction = function (aLanguage, aCodeboardConfig, aFiles) {
  var props = languageProperties[aLanguage];
  return props.getCommandForCompileAction(aFiles, aCodeboardConfig);
};


/**
 * Assumes: aLanguage is a valid language and has been sanitized
 *
 * @param {string} aLanguage the language for which to get the command
 * @param {object} aCodeboardConfig the codeboard config (e.g. codeboard.json) file
 * @return
 */
var getCommandForRunAction = function (aLanguage, aCodeboardConfig) {
  var props = languageProperties[aLanguage];
  return props.getCommandForRunAction(aCodeboardConfig);
};


/**
 * Returns the command for running a test action.
 *
 * @param aLanguage {string} aLanguage the language for which to get the command
 * @param aCodeboardConfig {object} aCodeboardConfig the codeboard config (e.g. codeboard.json) file
 * @param aFiles {file[]} aFiles array of the files to test (sometimes needed to generate the command)
 * @param aTestFiles {testFile[]} aTestFiles array of the files containing the tests
 * @returns {*}
 */
var getCommandForTestAction = function (aLanguage, aCodeboardConfig, aFiles, aTestFiles) {
  var props = languageProperties[aLanguage];
  return props.getCommandForTestAction(aFiles, aTestFiles, aCodeboardConfig);
};


/**
 * Returns 'true' is the given language requires a codeboard config (e.g. codeboard.json)
 * @param {String} aLanguage the programming language
 * @returns {boolean} true if language requires config, otherwise false
 */
var isCodeboardConfigRequired = function (aLanguage) {
  var props = languageProperties[aLanguage];
  return props.codeboardConfig.isRequired || false;
};


/**
 *
 *
 * Assumes: aLanguage is a valid language and has been sanitized
 *
 * @param {string} aLanguage the language for which to check a compiler output
 * @param {string} aCompilerOutput an output generated by a compiler
 * @return
 */
var hasCompilationErrors = function (aLanguage, aCompilerOutput) {
  var props = languageProperties[aLanguage];
  return props.hasCompilationErrors(aCompilerOutput);
};


/**
 * Parses the test output for the given language.
 * @param aLanguage {String} the language
 * @param aTestOutput {String} the output that was generated running the test action
 * @returns {*|{compilationError, numTestsPassing, numTestsFailing}} an object with three properties
 */
var parseTestOutput = function parseTestOutput (aLanguage, aTestOutput) {
  var props = languageProperties[aLanguage];
  return props.parseTestOutput(aTestOutput);
};


/**
 * Assumes: aLanguage is a valid language and has been sanitized
 *
 * @param {string} aLanguage the language for which to get the command
 * @return {string} the name of the container image for the given language
 */
var getDockerImageName = function (aLanguage) {
  var props = languageProperties[aLanguage];
  return props.dockerImage;
};


/**
 * Assumes: aLanguage is a valid language and has been sanitized
 * @param aLanguage
 * @returns {*}
 */
var getLanguageProperties = function (aLanguage) {
  return languageProperties[aLanguage];
};

module.exports = {
  isLanguageSupported: isLanguageSupported,
  isDynamicLanguage: isDynamicLanguage,
  isLanguageWithTestSupport: isLanguageWithTestSupport,
  getListOfValidLanguages: getListOfValidLanguages,
  getSanitizedLanguage: getSanitizedLanguage,
  getCommandForCompileAction: getCommandForCompileAction,
  getCommandForRunAction: getCommandForRunAction,
  getCommandForTestAction: getCommandForTestAction,
  hasCompilationErrors: hasCompilationErrors,
  parseTestOutput: parseTestOutput,
  getLanguageProperties: getLanguageProperties,

  isCodeboardConfigRequired: isCodeboardConfigRequired,
  getDockerImageName: getDockerImageName
}