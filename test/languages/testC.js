/**
 * Created by hce on 04/08/15.
 *
 * Test if the C property file creates correct
 * compile and run commands.
 */

'use strict';

var should = require('should'),
  languages = require('../../server/languages');


describe('languages/c.js: testing getActionForCommand', function () {

  var payload = {
    language: 'C',
    config: {},
    files: [
      {filename: 'Root/main.c', content: ''},
      {filename: 'Root/test.c', content: ''},
      {filename: 'Root/test2.c', content: ''}
    ]
  };


  it('Generates a correct compile command', function() {
    var cmd = languages.getCommandForCompileAction(payload.language, payload.config, payload.files);
    cmd.should.equal('gcc ./Root/main.c ./Root/test.c ./Root/test2.c && echo "Compilation successful"');
  });


  it('Generates a correct run command', function() {
    var cmd = languages.getCommandForRunAction(payload.language, payload.config);
    cmd.should.equal('./a.out');
  });

});
