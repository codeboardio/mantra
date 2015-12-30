/**
 * Created by hce on 04/08/15.
 *
 * Test if the C property file creates correct
 * compile and run commands.
 */

'use strict';

var should = require('should'),
  languages = require('../../server/languages');


describe('languages/cpp.js: testing getActionForCommand', function () {

  var payload = {
    language: 'C++',
    config: {},
    files: [
      {filename: 'Root/main.cpp', content: ''},
      {filename: 'Root/test.cpp', content: ''},
      {filename: 'Root/test2.cpp', content: ''}
    ]
  };


  it('Generates a correct compile command', function() {
    var cmd = languages.getCommandForCompileAction(payload.language, payload.config, payload.files);
    cmd.should.equal('g++ ./Root/main.cpp ./Root/test.cpp ./Root/test2.cpp && echo "Compilation successful"');
  });


  it('Generates a correct run command', function() {
    var cmd = languages.getCommandForRunAction(payload.language, payload.config);
    cmd.should.equal('./a.out');
  });

});
