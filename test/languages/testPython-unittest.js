/**
 * Created by hce on 04/08/15.
 *
 * Test if the Python-UnitTest property file creates correct
 * compile and run commands.
 */

'use strict';

var should = require('should'),
  languages = require('../../server/languages');


describe('languages/python-unittest.js: testing getActionForCommand', function () {

  var payload = {
    language: 'Python-UnitTest',
    config: {
      "MainFileForRunning": "./Root/src/main.py",
      "DirectoryForSourceFiles": "./Root/src",
      "DirectoryForTestFiles": "./Root/test",
      "DirectoryForTestSubmissionFiles": "./Root/testSubmission"
    },
    files: [
      {filename: 'Root/src/main.py', content: ''},
      {filename: 'Root/src/finder.py', content: ''},
      {filename: 'Root/test/test.py', content: ''}
    ]
  };


  it('Generates a correct compile command', function() {
    var cmd = languages.getCommandForCompileAction(payload.language, payload.config, payload.files);
    cmd.should.equal('python ./Root/src/main.py');
  });


  it('Generates a correct run command', function() {
    var cmd = languages.getCommandForRunAction(payload.language, payload.config);
    cmd.should.equal('python ./Root/src/main.py');
  });

});
