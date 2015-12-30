/**
 * The routes mantra can handle.
 * Each route runs a sequence of middleware functions which
 * perform various checks and gradually prepare the payload
 * to send back.
 *
 * Created by hce on 08/07/15.
 *
 */

'use strict';


var mw = require('./middleware.js');


module.exports = function(app) {

  // NOTE: why do we handle a dynamic language always as a compile action? Because we need to write the files to disk

  app.post('/', mw.createMantraReqObject, mw.verifyAction, mw.verifyLanguage, mw.verifyConfig, mw.verifyFiles, mw.writeFilesToDisk, mw.setCookie, mw.getCmdForCompileAction, mw.createContainer, mw.handleStreamOption);

  // here, we perform checks that are needed for both command "compile" and "run"
  app.post('/:mantraId', mw.createMantraReqObject, mw.verifyAction, mw.verifyLanguage, mw.verifyConfig, mw.nextRoute);
  // this sequence of middleware handles the "run" command
  app.post('/:mantraId', mw.handleDynamicLanguageNR, mw.verifyActionIsRunElseNR, mw.verifyMantraId, mw.setCookie, mw.getRunCommand, mw.createContainer, mw.handleStreamOption);
  // this sequence of middleware handles the "compile" command
  app.post('/:mantraId', mw.verifyActionIsCompileElseNR, mw.verifyFiles, mw.writeFilesToDisk, mw.setCookie, mw.getCmdForCompileAction, mw.createContainer, mw.handleStreamOption);


  // routes to start and stop a container (using websockets)
  app.post('/:mantraId/:containerId/start', mw.createMantraReqObject, mw.verifyMantraId, mw.startContainer);
  app.post('/:mantraId/:containerId/stop', mw.stopContainer);


  // All other routes should redirect to the index.html
  app.route('/*')
    .all(function(req, res) {
      res.status(404).json({msg: 'Requested resource does not exist.'});
    });
};


/**
 * A somewhat longer explanation on how the / route works
 *
 * Note: the order of the middleware is important because the functions build up the req.mantra object and
 * some functions assume that other functions have already added properties to req.mantra
 *
 *
 */

/**
 * A somewhat longer explanation on how the /:mantraId route works
 *
 * Note: the order of the middleware is important because the functions build up the req.mantra object and
 * some functions assume that other functions have already added properties to req.mantra
 *
 * First, create the req.mantra object (which is used to store all kinds of data along the way).
 *
 * Next, verify that the payload as a valid action (e.g. "compile" or "run"). This will also
 * add req.mantra.action (which then contains a sanitized version of the action).
 *
 * Next, verify that the payload has a valid language. Adds req.mantra.language.
 *
 * Next, verify that the payload has a config object (i.e. codeboard.json). Adds req.mantra.codeboardConfig
 *
 * Next, go to the next route.
 *
 * It's now important that the next route is handling "run" commands.
 *
 * First, check if the language is a dynamic language (e.g. Python) and the payload has files. If true,
 * then move on to the next route which handles compilation. That's because for dynamic languages, the actions
 * "compile" and "run" are treated the same way. In our middleware, however, only the "compile" action
 * will actually write files to disk. In contrast, a "run" will verify that :mantraId is valid and load whatever
 * files are stored at the location of :mantraId.
 *
 * Next, we check that the action is "run". If not, we move to the next route.
 *
 * (The action is run.) Next, we verify that the mantraId is a valid MantraId. This is important, because
 * we'll try to mount the mantraId folder into the container. Thus it needs to be valid.
 *
 * Next, we get the command "running" the program inside a container.
 *
 * Next, we create the container with the command and return the address of the container's websocket and
 * the Url how to start the container.
 *
 *
 * The route for "compile" command: we verify that the action is compile (here, the "run" action from the previous
 * route for a dynamic language, e.g. Python) might have been rewritten. If the command is not "compile" we move to
 * the next route.
 *
 * Next (on the "compile" route) we check that the payload has an array "files" and that it's not empty.
 *
 * Next, we write the files to disk and store the mantraId in req.mantra.mantraId
 *
 * Next, we get command for "compiling" the project.
 *
 * Next, we create the container with the command and return the address of the container's websocket and
 * the Url how to start the container.
 *
 */
