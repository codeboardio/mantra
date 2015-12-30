/**
 * Created by hce on 04/08/15.
 *
 * Test if the Haskell-HSpec property file creates correct
 * compile and run commands.
 */

'use strict';

var should = require('should'),
  languages = require('../../server/languages');


describe('languages/haskell-hspec.js: testing getActionForCommand', function () {

  var payload = {
    language: 'Haskell-HSpec',
    config: {
      "MainFileForCompilation": "./Root/Src/Main.hs",
      "GHCArgumentMainIs": "Root.Src.Main.main",
      "DirectoryForSourceFiles": "./Root/Src",
      "DirectoryForTestFiles": "./Root/Test",
      "DirectoryForTestSubmissionFiles": "./Root/TestSubmission"
    },
    files: [
      {filename: 'Root/src/Main.hs', content: ''},
      {filename: 'Root/src/Finder.hs', content: ''},
      {filename: 'Root/test/TestMain.hs', content: ''}
    ]
  };


  it('Generates a correct compile command', function() {
    var cmd = languages.getCommandForCompileAction(payload.language, payload.config, payload.files);
    cmd.should.equal('ghc -main-is Root.Src.Main.main ./Root/src/Main.hs ./Root/src/Finder.hs ./Root/test/TestMain.hs -o output.out');
  });


  it('Generates a correct run command', function() {
    var cmd = languages.getCommandForRunAction(payload.language, payload.config);
    cmd.should.equal('./output.out');
  });

});
