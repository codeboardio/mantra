var app = require('../../../server/server.js'),
  request = require('supertest'),
  express = require('express'),
  should = require('should'),
  bodyParser = require('body-parser'),
  fs = require('fs'),
  utilTest = require('../../helper/utilForTesting.js'),
  testConfig = require('./testFunctionalConfig.js');

app.use(bodyParser());

describe('Test Mantra with Haskell compilation', function () {

  this.timeout(testConfig.timeOut);

  it('Mantra Haskell: successful compilation (one file)', function (done) {
    var folder = testConfig.getTestResource("haskell/hs_one_file");

    utilTest.generateTestFromFolder(folder, "Haskell", "compile", function (data) {
      request(app)
        .post('/')
        .send(data)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (error, reply) {
          //console.log(reply.body.output);
          var compiles = (reply.body.output.indexOf("Compilation successful") != -1) || (reply.body.output.indexOf("Linking output.out ...") != -1)
          compiles.should.equal(true);
          reply.body.compilationError.should.equal(false);
          reply.body.id.should.not.equal(undefined);
          done();
        })
    });

  });

  it('Mantra Haskell: successful compilation (several files)', function (done) {
    var folder = testConfig.getTestResource("haskell/hs_several_files");

    utilTest.generateTestFromFolder(folder, "Haskell", "compile", function (data) {
      request(app)
        .post('/')
        .send(data)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (error, reply) {
          //console.log(reply.body.output);
          var compiles = (reply.body.output.indexOf("Compilation successful") != -1) || (reply.body.output.indexOf("Linking output.out ...") != -1)
          compiles.should.equal(true);
          reply.body.compilationError.should.equal(false);
          reply.body.id.should.not.equal(undefined);
          done();
        });
    });
  });

  it('Mantra Haskell: successful compilation (several files in folders)', function (done) {
    var folder = testConfig.getTestResource("haskell/hs_several_files_folders");

    utilTest.generateTestFromFolder(folder, "Haskell", "compile", function (data) {
      request(app)
        .post('/')
        .send(data)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (error, reply) {
          //console.log(reply.body.output);
          var compiles = (reply.body.output.indexOf("Compilation successful") != -1) || (reply.body.output.indexOf("Linking output.out ...") != -1)
          compiles.should.equal(true);
          reply.body.compilationError.should.equal(false);
          reply.body.id.should.not.equal(undefined);
          done();
        });
    });
  });

  it('Mantra Haskell: error in setting file', function (done) {
    var folder = testConfig.getTestResource("haskell/hs_error_setting_file");

    utilTest.generateTestFromFolder(folder, "Haskell", "compile", function (data) {
      request(app)
        .post('/')
        .send(data)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (error, reply) {
          (reply.body.msg.indexOf("The provided Codeboard configuration (codeboard.json) violates the JSON format.")).should.not.equal(-1);
          done();
        });
    });
  });

  it('Mantra Haskell: error in setting file (missing setting file)', function (done) {
    var folder = testConfig.getTestResource("haskell/hs_error_missing_setting");

    utilTest.generateTestFromFolder(folder, "Haskell", "compile", function (data) {
      request(app)
        .post('/')
        .send(data)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (error, reply) {
          (reply.body.msg.indexOf("The provided files are missing the Codeboard configuration file (codeboard.json).")).should.not.equal(-1);
          done();
        });
    });
  });


  it('Mantra Haskell: error in compilation (one file)', function (done) {
    var folder = testConfig.getTestResource("haskell/hs_error_one_file");

    utilTest.generateTestFromFolder(folder, "Haskell", "compile", function (data) {
      request(app)
        .post('/')
        .send(data)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (error, reply) {
          //console.log(reply.body.output);
          var compiles = (reply.body.output.indexOf("Compilation successful") != -1) || (reply.body.output.indexOf("Linking output.out ...") != -1)
          compiles.should.equal(false);
          reply.body.compilationError.should.equal(true);
          reply.body.id.should.not.equal(undefined);
          (reply.body.output.indexOf("Root/Main.hs:2:3: Not in scope: `foo'")).should.not.equal(-1);
          done();
        });
    });
  });

  it('Mantra Haskell: error in compilation (missing main file)', function (done) {
    var folder = testConfig.getTestResource("haskell/hs_error_main");

    utilTest.generateTestFromFolder(folder, "Haskell", "compile", function (data) {
      request(app)
        .post('/')
        .send(data)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (error, reply) {
          //console.log(reply.body.output);
          var compiles = (reply.body.output.indexOf("Compilation successful") != -1) || (reply.body.output.indexOf("Linking output.out ...") != -1)
          compiles.should.equal(false);
          reply.body.compilationError.should.equal(true);
          reply.body.id.should.not.equal(undefined);
          (reply.body.output.indexOf("Warning: output was redirected with -o, but no output will be generated")).should.not.equal(-1);
          done();
        });
    });
  });

  it('Mantra Haskell: error in compilation (several files)', function (done) {
    var folder = testConfig.getTestResource("haskell/hs_error_several_files");

    utilTest.generateTestFromFolder(folder, "Haskell", "compile", function (data) {
      request(app)
        .post('/')
        .send(data)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (error, reply) {
          //console.log(reply.body.output);
          var compiles = (reply.body.output.indexOf("Compilation successful") != -1) || (reply.body.output.indexOf("Linking output.out ...") != -1)
          compiles.should.equal(false);
          reply.body.compilationError.should.equal(true);
          reply.body.id.should.not.equal(undefined);
          (reply.body.output.indexOf("application.hs:1:8:")).should.not.equal(-1);
          (reply.body.output.indexOf("Could not find module `B'")).should.not.equal(-1);
          done();
        });
    });
  });

  it('Mantra Haskell: successful incremental compilation ', function (done) {
    var folder = testConfig.getTestResource("haskell/hs_incremental1");

    utilTest.generateTestFromFolder(folder, "Haskell", "compile", function (data) {
      request(app)
        .post('/')
        .send(data)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (error, reply) {
          var folder = testConfig.getTestResource("haskell/hs_incremental2");

          reply.body.compilationError.should.equal(true);
          reply.body.id.should.not.equal(undefined);
          utilTest.generateTestFromFolder(folder, "Haskell", "compile", function (data) {
            data.id = reply.body.id;
            request(app)
              .post('/' + data.id)
              .send(data)
              .expect('Content-Type', /json/)
              .expect(200)
              .end(function (error, reply) {
                //console.log(reply.body.output);
                var compiles = (reply.body.output.indexOf("Compilation successful") != -1) || (reply.body.output.indexOf("Linking output.out ...") != -1)
                compiles.should.equal(true);
                reply.body.compilationError.should.equal(false);
                reply.body.id.should.not.equal(undefined);
                data.id.should.equal(reply.body.id);
                done();
              });
          });
        });
    });
  });


  it('Mantra Haskell: error in incremental compilation ', function (done) {
    var folder = testConfig.getTestResource("haskell/hs_error_incremental1");

    utilTest.generateTestFromFolder(folder, "Haskell", "compile", function (data) {
      request(app)
        .post('/')
        .send(data)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (error, reply) {
          var folder = testConfig.getTestResource("haskell/hs_error_incremental1");
          utilTest.generateTestFromFolder(folder, "Haskell", "compile", function (data) {
            data.id = reply.body.id;
            request(app)
              .post('/' + data.id)
              .send(data)
              .expect('Content-Type', /json/)
              .expect(200)
              .end(function (error, reply) {
                //console.log(reply.body.output);
                var compiles = (reply.body.output.indexOf("Compilation successful") != -1) || (reply.body.output.indexOf("Linking output.out ...") != -1)
                compiles.should.equal(false);
                reply.body.compilationError.should.equal(true);
                reply.body.id.should.not.equal(undefined);
                (reply.body.output.indexOf("application.hs:1:8:")).should.not.equal(-1);
                (reply.body.output.indexOf("Could not find module `B'")).should.not.equal(-1);
                done();
              });
          });
        });
    });
  });


  it('Mantra Haskell: successful incremental compilation with wrong ID', function (done) {
    var folder = testConfig.getTestResource("haskell/hs_wrong_id1");

    utilTest.generateTestFromFolder(folder, "Haskell", "compile", function (data) {
      request(app)
        .post('/')
        .send(data)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (error, reply) {
          reply.body.id.should.not.equal(undefined);
          data.id = "WRONG_ID";
          request(app)
            .post('/' + data.id)
            .send(data)
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function (error, reply) {
              //console.log(reply.body.output);
              var compiles = (reply.body.output.indexOf("Compilation successful") != -1) || (reply.body.output.indexOf("Linking output.out ...") != -1)
              compiles.should.equal(true);
              reply.body.compilationError.should.equal(false);
              reply.body.id.should.not.equal(undefined);
              done();
            });
        });
    });
  });

  it('Mantra Haskell: successful run (one file)', function (done) {
    var folder = testConfig.getTestResource("haskell/hs_run_file");

    utilTest.generateTestFromFolder(folder, "Haskell", "compile", function (data) {
      request(app)
        .post('/')
        .send(data)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (error, reply) {
          //console.log(reply.body.output);
          var compiles = (reply.body.output.indexOf("Compilation successful") != -1) || (reply.body.output.indexOf("Linking output.out ...") != -1)
          compiles.should.equal(true);
          reply.body.compilationError.should.equal(false);
          reply.body.id.should.not.equal(undefined);
          var data2 = {};
          data2.language = 'Haskell';
          data2.action = 'run';
          data2.id = reply.body.id;
          data2.stream = false;
          request(app)
            .post('/' + data2.id)
            .send(data2)
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function (error, reply) {
              //console.log(reply.body.output);
              reply.body.output.should.not.equal(undefined);
              (reply.body.output.indexOf("Hello Haskell World!")).should.not.equal(-1);
              done();
            });
        });
    });
  });

  it('Mantra Haskell: successful run (several files)', function (done) {
    var folder = testConfig.getTestResource("haskell/hs_run_several_files");

    utilTest.generateTestFromFolder(folder, "Haskell", "compile", function (data) {
      request(app)
        .post('/')
        .send(data)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (error, reply) {
          var compiles = (reply.body.output.indexOf("Compilation successful") != -1) || (reply.body.output.indexOf("Linking output.out ...") != -1)
          compiles.should.equal(true);
          reply.body.compilationError.should.equal(false);
          reply.body.id.should.not.equal(undefined);
          var data2 = {};
          data2.language = 'Haskell';
          data2.action = 'run';
          data2.id = reply.body.id;
          data2.stream = false;
          request(app)
            .post('/' + data2.id)
            .send(data2)
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function (error, reply) {
              //console.log(reply.body.output);
              reply.body.output.should.not.equal(undefined);
              (reply.body.output.indexOf("Hello Haskell World!")).should.not.equal(-1);
              (reply.body.output.indexOf("Hello B")).should.not.equal(-1);
              (reply.body.output.indexOf("Hello C")).should.not.equal(-1);
              done();
            });
        });
    });
  });

  it('Mantra Haskell: successful run (several files in folders)', function (done) {
    var folder = testConfig.getTestResource("haskell/hs_run_several_files_folder");

    utilTest.generateTestFromFolder(folder, "Haskell", "compile", function (data) {
      request(app)
        .post('/')
        .send(data)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (error, reply) {
          var compiles = (reply.body.output.indexOf("Compilation successful") != -1) || (reply.body.output.indexOf("Linking output.out ...") != -1)
          compiles.should.equal(true);
          reply.body.compilationError.should.equal(false);
          reply.body.id.should.not.equal(undefined);
          var data2 = {};
          data2.language = 'Haskell';
          data2.action = 'run';
          data2.id = reply.body.id;
          data2.stream = false;
          request(app)
            .post('/' + data2.id)
            .send(data2)
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function (error, reply) {
              //console.log(reply.body.output);
              reply.body.output.should.not.equal(undefined);
              (reply.body.output.indexOf("Hello Haskell World!")).should.not.equal(-1);
              (reply.body.output.indexOf("Hello P1.B")).should.not.equal(-1);
              (reply.body.output.indexOf("Hello P1.C")).should.not.equal(-1);
              done();
            });
        });
    });
  });

  it('Mantra Haskell: invalid run due to invalid ID', function (done) {
    var folder = testConfig.getTestResource("haskell/hs_run_invalid_id");

    utilTest.generateTestFromFolder(folder, "Haskell", "run", function (data) {
      data.id = "INVALID_ID";
      request(app)
        .post('/' + data.id)
        .send(data)
        .expect('Content-Type', /json/)
        .expect(404)
        .end(function (error, reply) {
          reply.body.msg.should.not.equal(undefined);
          (reply.body.msg.indexOf("The id INVALID_ID is not valid. Try compiling your project and then execute this request again.")).should.not.equal(-1);
          done();
        });
    });
  });
});