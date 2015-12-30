/**
 * Created by hce on 04/08/15.
 *
 * Test if the Haskell property file creates correct
 * compile and run commands.
 */

'use strict';

var should = require('should'),
  languages = require('../../server/languages');


describe('languages/haskell-hspec.js: testing getActionForCommand', function () {

  var payload = {
    language: 'Haskell-HSpec',
    config: {
      "MainFileForCompilation": "Main.hs",
      "GHCArgumentMainIs": "Main.main"
    },
    files: [
      {filename: 'Root/Main.hs', content: ''},
      {filename: 'Root/Finder.hs', content: ''}
    ]
  };


  it('Generates a correct compile command', function() {
    var cmd = languages.getCommandForCompileAction(payload.language, payload.config, payload.files);
    cmd.should.equal('ghc -main-is Main.main ./Root/Main.hs ./Root/Finder.hs -o output.out');
  });


  it('Generates a correct run command', function() {
    var cmd = languages.getCommandForRunAction(payload.language, payload.config);
    cmd.should.equal('./output.out');
  });

});
