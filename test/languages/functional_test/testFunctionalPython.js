var app = require('../../../server/server.js'),
  request = require('supertest'),
  express = require('express'),
  should = require('should'),
  bodyParser = require('body-parser'),
  fs = require('fs'),
  utilTest = require('../../helper/utilForTesting.js'),
  testConfig = require('./testFunctionalConfig.js');

app.use(bodyParser());

describe('Test Mantra with Python compilation', function () {

  this.timeout(testConfig.timeOut);

  it('Mantra Python: successful compilation (one file)', function (done) {
    var folder = testConfig.getTestResource("python/py_one_file");

    utilTest.generateTestFromFolder(folder, "Python", "compile", function (data) {
      request(app)
        .post('/')
        .send(data)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (error, reply) {
          //console.log(reply.body.output);
          (reply.body.output.indexOf("Goodbye, World!")).should.not.equal(-1);
          reply.body.compilationError.should.equal(false);
          reply.body.id.should.not.equal(undefined);
          done();
        })
    });
  });

  it('Mantra Python: successful compilation (several files)', function (done) {
    var folder = testConfig.getTestResource("python/py_several_files");

    utilTest.generateTestFromFolder(folder, "Python", "compile", function (data) {
      request(app)
        .post('/')
        .send(data)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (error, reply) {
          //console.log(reply.body.id);
          //console.log(reply.body.output);
          (reply.body.output.indexOf("Goodbye, foo!")).should.not.equal(-1);
          (reply.body.output.indexOf("Goodbye, World!")).should.not.equal(-1);
          reply.body.compilationError.should.equal(false);
          reply.body.id.should.not.equal(undefined);
          done();
        });
    });
  });

  it('Mantra Python: successful compilation (several files in folders)', function (done) {
    var folder = testConfig.getTestResource("python/py_several_files_folder");

    utilTest.generateTestFromFolder(folder, "Python", "compile", function (data) {
      request(app)
        .post('/')
        .send(data)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (error, reply) {
          //console.log(reply.body.id);
          //console.log(reply.body.output);
          (reply.body.output.indexOf("Goodbye, P1.foo!")).should.not.equal(-1);
          (reply.body.output.indexOf("Goodbye, P1.bar!")).should.not.equal(-1);
          (reply.body.output.indexOf("Goodbye, World!")).should.not.equal(-1);
          reply.body.id.should.not.equal(undefined);
          done();
        });
    });
  });

  it('Mantra Python: error in setting file', function (done) {
    var folder = testConfig.getTestResource("python/py_error_setting");

    utilTest.generateTestFromFolder(folder, "Python", "compile", function (data) {
      request(app)
        .post('/')
        .send(data)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (error, reply) {
          //console.log(reply.body);
          (reply.body.msg.indexOf("The provided Codeboard configuration (codeboard.json) violates the JSON format.")).should.not.equal(-1);
          done();
        });
    });
  });

  it('Mantra Python: error in setting file (missing setting file)', function (done) {
    var folder = testConfig.getTestResource("python/py_error_missing_setting");

    utilTest.generateTestFromFolder(folder, "Python", "compile", function (data) {
      request(app)
        .post('/')
        .send(data)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (error, reply) {
          //console.log(reply.body);
          (reply.body.msg.indexOf("The provided files are missing the Codeboard configuration file (codeboard.json).")).should.not.equal(-1);
          done();
        });
    });
  });

  it('Mantra Python: error in compilation (one file)', function (done) {
    var folder = testConfig.getTestResource("python/py_error_one_file");

    utilTest.generateTestFromFolder(folder, "Python", "compile", function (data) {
      request(app)
        .post('/')
        .send(data)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (error, reply) {
          //console.log(reply.body.output);
          reply.body.id.should.not.equal(undefined);
          (reply.body.output.indexOf("NameError: name 'foo23' is not defined")).should.not.equal(-1);
          (reply.body.output.indexOf('File "./Root/application.py", line 1, in <module>')).should.not.equal(-1);
          done();
        });
    });
  });

  it('Mantra Python: error in compilation (missing main file)', function (done) {
    var folder = testConfig.getTestResource("python/py_error_main");

    utilTest.generateTestFromFolder(folder, "Python", "compile", function (data) {
      request(app)
        .post('/')
        .send(data)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (error, reply) {
          //console.log(reply.body.output);
          reply.body.id.should.not.equal(undefined);
          (reply.body.output.indexOf("python: can't open file './Root/application.py': [Errno 2] No such file or directory")).should.not.equal(-1);
          done();
        });
    });
  });

  it('Mantra Python: error in compilation (several files)', function (done) {
    var folder = testConfig.getTestResource("python/py_error_several_files");

    utilTest.generateTestFromFolder(folder, "Python", "compile", function (data) {
      request(app)
        .post('/')
        .send(data)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (error, reply) {
          //console.log(reply.body.output);
          reply.body.id.should.not.equal(undefined);
          (reply.body.output.indexOf('File "./Root/application.py", line 1, in <module>')).should.not.equal(-1);
          (reply.body.output.indexOf("from b import foo")).should.not.equal(-1);
          (reply.body.output.indexOf("ImportError: No module named b")).should.not.equal(-1);
          done();
        });
    });
  });

  it('Mantra Python: successful incremental compilation ', function (done) {
    var folder = testConfig.getTestResource("python/py_incremental1");

    utilTest.generateTestFromFolder(folder, "Python", "compile", function (data) {
      request(app)
        .post('/')
        .send(data)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (error, reply) {
          var folder = testConfig.getTestResource("python/py_incremental2");

          //reply.body.compilationError.should.equal(true);
          reply.body.id.should.not.equal(undefined);
          utilTest.generateTestFromFolder(folder, "Python", "compile", function (data) {
            data.id = reply.body.id;
            request(app)
              .post('/' + data.id)
              .send(data)
              .expect('Content-Type', /json/)
              .expect(200)
              .end(function (error, reply) {
                (reply.body.output.indexOf("Goodbye, foo!")).should.not.equal(-1);
                (reply.body.output.indexOf("Goodbye, World!")).should.not.equal(-1);
                reply.body.compilationError.should.equal(false);
                reply.body.id.should.not.equal(undefined);
                data.id.should.equal(reply.body.id);
                done();
              });
          });
        });
    })
  });

  it('Mantra Python: error in incremental compilation ', function (done) {
    var folder = testConfig.getTestResource("python/py_error_incremental1");

    utilTest.generateTestFromFolder(folder, "Python", "compile", function (data) {
      request(app)
        .post('/')
        .send(data)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (error, reply) {
          var folder = testConfig.getTestResource("python/py_error_incremental2");

          utilTest.generateTestFromFolder(folder, "Python", "compile", function (data) {
            data.id = reply.body.id;
            request(app)
              .post('/' + data.id)
              .send(data)
              .expect('Content-Type', /json/)
              .expect(200)
              .end(function (error, reply) {
                //console.log(reply.body.output);
                reply.body.id.should.not.equal(undefined);
                (reply.body.output.indexOf('File "./Root/application.py", line 1, in <module>')).should.not.equal(-1);
                (reply.body.output.indexOf("from b import foo")).should.not.equal(-1);
                (reply.body.output.indexOf("ImportError: No module named b")).should.not.equal(-1);
                data.id.should.equal(reply.body.id);
                done();
              });
          });
        });
    });
  });

  it('Mantra Python: successful incremental compilation with wrong ID', function (done) {
    var folder = testConfig.getTestResource("python/py_wrong_id1");

    utilTest.generateTestFromFolder(folder, "Python", "compile", function (data) {
      request(app)
        .post('/')
        .send(data)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (error, reply) {
          var folder = testConfig.getTestResource("python/py_wrong_id2");

          utilTest.generateTestFromFolder(folder, "Python", "compile", function (data) {
            data.id = "WRONG_ID";
            request(app)
              .post('/' + data.id)
              .send(data)
              .expect('Content-Type', /json/)
              .expect(200)
              .end(function (error, reply) {
                (reply.body.output.indexOf("Goodbye, foo!")).should.not.equal(-1);
                (reply.body.output.indexOf("Goodbye, World!")).should.not.equal(-1);
                reply.body.compilationError.should.equal(false);
                reply.body.id.should.not.equal(undefined);
                done();
              });
          });
        });
    });
  });

  // Note that this post takes the files, and it is an special case in Python.
  it('Mantra Python: Special in Python: valid run even with invalid ID', function (done) {
    var folder = testConfig.getTestResource("python/py_run_invalid_id");

    utilTest.generateTestFromFolder(folder, "Python", "compile", function (data) {
      request(app)
        .post('/' + data.id)
        .send(data)
        .expect('Content-Type', /json/)
        .expect(404)
        .end(function (error, reply) {
          reply.body.output.should.not.equal(undefined);
          (reply.body.output.indexOf("Goodbye, World!")).should.not.equal(-1);
          done();
        });
    });
  });


});