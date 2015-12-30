/**
 * Created by hce on 09/07/15.
 *
 * Tests for function from util.js
 *
 */


'use strict';

var util = require('../server/util.js'),
  path = require('path'),
  should = require('should'),
  config = require('../server/config/env');

describe('Util.js: testing ACTION functions', function () {


  it('Identifies "compile" action', function () {
    // should pass

    util.getSanitizedAction("COMPILE")

    util.isActionCompile(util.getSanitizedAction("COMPILE")).should.equal(true);
    util.isActionCompile(util.getSanitizedAction("compile")).should.equal(true);
    util.isActionCompile(util.getSanitizedAction(" Compile  ")).should.equal(true);

    // should fail
    util.isActionCompile(util.getSanitizedAction("foobar")).should.equal(false);
    util.isActionCompile(util.getSanitizedAction("Run")).should.equal(false);
  });


  it('Identifies "run" action', function () {
    // should pass
    util.isActionRun(util.getSanitizedAction("RUN")).should.equal(true);
    util.isActionRun(util.getSanitizedAction("run")).should.equal(true);
    util.isActionRun(util.getSanitizedAction(" Run  ")).should.equal(true);

    // should fail
    util.isActionRun(util.getSanitizedAction("foobar")).should.equal(false);
    util.isActionRun(util.getSanitizedAction("Compile")).should.equal(false);
  });
});


describe('Util.js: testing getRandomId function', function (){


  it('Generates Ids with more than 30 characters', function () {
    var id1 = util.getRandomId();
    var id2 = util.getRandomId();
    var id3 = util.getRandomId();

    (id1.length >= 30).should.be.true();
    (id2.length >= 30).should.be.true();
    (id3.length >= 30).should.be.true();
  });


  it('Generated Ids are different', function () {
    var id1 = util.getRandomId();
    var id2 = util.getRandomId();
    var id3 = util.getRandomId();

    (id1 === id2).should.be.false();
    (id1 === id3).should.be.false();
    (id2 === id3).should.be.false();
  });
});


describe('Util.js: testing isValidMantraId function', function (){

  var mantraId = util.getRandomId();
  var mantraIdPath = path.join(config.mantraPath, mantraId);

  // create a mantra id folder
  before(function() {
    var mkd = require('mkdirp');
    mkd.mkdirp.sync(mantraIdPath);
  });


  it('Returns a promise that resolve to true for valid a MantraId', function (done) {
    var promise = util.isValidMantraId(mantraId);

    promise.then(function(valid) {
      valid.should.be.ok();
      done();
    });
  });


  it('Returns a promise that resolve to false for an invalid MantraId', function (done) {
    var promise = util.isValidMantraId(mantraId + 'xyz');

    promise.then(function(valid) {
      valid.should.not.be.ok();
      done();
    });
  });


  it('Returns a promise that resolve to false for a too old MantraId', function (done) {

    // Note: this test temporarily overrides the value for the max life time for a mantra Id
    // this way, we can simulate that a  mantraId is too old after just a second

    // set the mocha timeout for this test
    this.timeout(3000);

    // temporarily overwrite the maximum life time of a mantraId
    var orgMaxLifeTimeForMantraId = config.maxLifeTimeForMantraId;
    config.maxLifeTimeForMantraId = 1; // set the timeout to 1 second

    // delay the query if mantraId is too old by 1,5 seconds
    setTimeout(function() {
      var promise = util.isValidMantraId(mantraId);
      promise.then(function(valid) {

        valid.should.not.be.ok();

        // set the maxLifeTimeForMantraId back to it's original value
        config.maxLifeTimeForMantraId = orgMaxLifeTimeForMantraId;

        done();
      });

    }, (config.maxLifeTimeForMantraId * 1000) + 500);
    // above: config.maxLifeTimeForMantraId is in secs, but setTimeout needs a timeout in milli-secs

  });


  it ('Consecutive test of id exists, id was deleted', function(done) {

    // Note: we use this test to run the validId-check twice, first time is should say "isValid", then "not isValid"

    // create the folder
    var mantraId = util.getRandomId();
    var mantraIdPath = path.join(config.mantraPath, mantraId);
    var mkd = require('mkdirp');
    mkd.mkdirp.sync(mantraIdPath);

    // test if id is valid
    util.isValidMantraId(mantraId)
      .then(function(valid) {
        valid.should.be.ok();

        // remove the folder
        var fs = require('fs');
        fs.rmdirSync(mantraIdPath);

        // test if the id still valid
        util.isValidMantraId(mantraId)
          .then(function(aIsValid) {
            aIsValid.should.not.be.ok();
            done();
          });
      });
  });


  // remove the mantra id folder
  after(function() {
    var fs = require('fs');
    fs.rmdirSync(mantraIdPath);
  });

});


describe('Util.js: testing getListOfFilenames', function (){

  var fileArray = [
    {
      filename: 'Root/path/file1.java',
      content: ''
    },
    {
      filename: 'Root/path/more/file2.java',
      content: ''
    },
    {
      filename: 'Root/codeboard.json',
      content: ''
    }
  ];


  it('Generates string with all filenames that match pattern', function () {
    var filenameString = util.getListOfFilenames(fileArray, '.java');
    filenameString.should.equal('./Root/path/file1.java ./Root/path/more/file2.java');
  });


  it('Returns an empty string for an emtpy input', function () {
    var filenameString = util.getListOfFilenames([], '.java');
    filenameString.should.equal('');
  });
});


describe('Util.js: testing getCodeboardConfigObject', function(){

  var fileArray = [
    {
      filename: 'Root/path/file1.java',
      content: ''
    },
    {
      filename: 'Root/path/more/file2.java',
      content: ''
    },
    {
      filename: 'Root/codeboard.json',
      content: '{}'
    }
  ];

  it('Finds the entry with name codeboard.json', function(){
    var configObject = util.getCodeboardConfigObject(fileArray, 'codeboard.json');
    configObject.should.equal(fileArray[2]);
  });


  it('Uses codeboard.json as the default config name', function(){
    var configObject = util.getCodeboardConfigObject(fileArray);
    configObject.should.equal(fileArray[2]);
  });

  var fileArray2 = [
    {
      filename: 'Root/path/file1.java',
      content: ''
    },
    {
      filename: 'Root/path/more/file2.java',
      content: ''
    }
  ];

  it('Returns null if no config object exists', function(){
    var configObject = util.getCodeboardConfigObject(fileArray2, 'codeboard.json');
    // test for null
    should.equal(configObject, null);
  });

});


describe('Util.js: testing writeFilesToDisk', function(){

  // set a larger timeout for these tests (sync deleting sometimes takes longer)
  this.timeout(9000);

  var lPath = path.join(config.mantraPath, 'mantratest');

  var fileArray = [
    {
      filename: 'Root/path/file1.java',
      content: 'test content'
    },
    {
      filename: 'Root/path/more/file2.java',
      content: 'test content'
    },
    {
      filename: 'Root/codeboard.json',
      content: '{"test":"content"}'
    }
  ];

  var fileArray2 = [
    {
      filename: 'Root/path/file2.java',
      content: 'test content'
    }
  ];


  // remove the files and folders created on disk
  afterEach(function() {
    var execSync = require('child_process').execSync;
    execSync('rm -rf ' + config.mantraPath);
  });


  it('Writes files to disk', function(done){
    var promise = util.writeFilesToDisk(fileArray, lPath);
    promise.then(function() {

      var fs = require('fs');
      var file0 = fs.readFileSync(path.join(lPath, fileArray[0].filename), 'utf8');
      var file1 = fs.readFileSync(path.join(lPath, fileArray[1].filename), 'utf8');
      var file2 = fs.readFileSync(path.join(lPath, fileArray[2].filename), 'utf8');

      file0.should.equal(fileArray[0].content);
      file1.should.equal(fileArray[1].content);
      file2.should.equal(fileArray[2].content);

      done();
    });
  });


  it('Can use existing folders and files', function(done){
    var promise = util.writeFilesToDisk(fileArray, lPath);

    promise
      .then(function() {
        return util.writeFilesToDisk(fileArray2, lPath);
      })
      .then(function() {

        var fs = require('fs');
        // read files according to fileArray
        var file0 = fs.readFileSync(path.join(lPath, fileArray[0].filename), 'utf8');
        var file1 = fs.readFileSync(path.join(lPath, fileArray[1].filename), 'utf8');
        var file2 = fs.readFileSync(path.join(lPath, fileArray[2].filename), 'utf8');
        // read files according to fileArray2
        var file3 = fs.readFileSync(path.join(lPath, fileArray2[0].filename), 'utf8');


        // check that files' content matches
        file0.should.equal(fileArray[0].content);
        file1.should.equal(fileArray[1].content);
        file2.should.equal(fileArray[2].content);
        // fileArray2 content here
        file3.should.equal(fileArray2[0].content);

        done();
      });
  });


  it('Can handle an empty array of files', function(done){
    var promise = util.writeFilesToDisk([], lPath);

    promise
      .then(function() {
        // we check that nothing was written (no folders created)
        var fs = require('fs');
        fs.existsSync(lPath).should.not.be.ok();

        done();
      });
  });

});
