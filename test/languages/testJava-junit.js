/**
 * Created by hce on 04/08/15.
 *
 * Test if the Java-JUnit property file creates correct
 * compile and run commands.
 */

'use strict';

var app = require('../../server/server.js'),
  should = require('should'),
  languages = require('../../server/languages'),
  utilTest = require('../helper/utilForTesting.js'),
  request = require('supertest');





describe('languages/java-junit.js: testing getActionForCommand', function () {

  var payload = {
    language: 'Java-JUnit',
    config: {
      MainClassForRunning: 'Main',
      ClassPath: '/usr/bin',
      DirectoryForClassFiles: './Root/bin',
      DirectoryForSourceFiles: './Root/src',
      DirectoryForTestFiles: './Root/test' ,
      DirectoryForTestSubmissionFiles: './Root/subTest'
    },
    files: [
      {filename: 'Root/src/Main.java', content: ''},
      {filename: 'Root/src/Finder.java', content: ''},
      {filename: 'Root/test/TestMain.java', content: ''}
    ]
  };


  it('Generates a correct compile command', function() {
    var cmd = languages.getCommandForCompileAction(payload.language, payload.config, payload.files);
    cmd.should.equal('mkdir -p ./Root/bin;javac -cp "/usr/bin" -d "./Root/bin" ./Root/src/Main.java ./Root/src/Finder.java ./Root/test/TestMain.java && echo "Compilation successful"');
  });


  it('Generates a correct run command', function() {
    var cmd = languages.getCommandForRunAction(payload.language, payload.config);
    cmd.should.equal('java -cp ./Root/bin Main');
  });

});
