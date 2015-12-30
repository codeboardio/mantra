/**
 * Created by hce on 04/08/15.
 *
 * Test if the Java property file creates correct
 * compile and run commands.
 */

'use strict';

var should = require('should'),
  languages = require('../../server/languages');


describe('languages/java-junit.js: testing getActionForCommand', function () {

  var payload = {
    language: 'Java',
    config: {
      "MainFileForCompilation": "Main.java",
      "MainClassForRunning": "Main"
    },
    files: [
      {filename: 'Root/Main.java', content: ''},
      {filename: 'Root/Finder.java', content: ''},
    ]
  };


  it('Generates a correct compile command', function() {
    var cmd = languages.getCommandForCompileAction(payload.language, payload.config, payload.files);
    cmd.should.equal('javac ./Root/Main.java ./Root/Finder.java && echo "Compilation successful"');
  });


  it('Generates a correct run command', function() {
    var cmd = languages.getCommandForRunAction(payload.language, payload.config);
    cmd.should.equal('java -cp ./Root Main');
  });

});
