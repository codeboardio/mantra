var app = require('../../../server/server.js'),
  request = require('supertest'),
  express = require('express'),
  should = require('should'),
  bodyParser = require('body-parser'),
  fs = require('fs'),
  utilTest = require('../../helper/utilForTesting.js'),
  testConfig = require('./testFunctionalConfig.js');

app.use(bodyParser());

describe('Test Mantra with Python-UnitTest ', function () {

  it('Mantra Python-UnitTest: error compiling', function (done) {
    // get the source files
    var folder = testConfig.getTestResource("python-unittest/py_error_one_file");
    utilTest.generateTestFromFolder(folder, "Python-UnitTest", "compile", function (data) {
      request(app)
          .post('/')
          .send(data)
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (error, reply) {
            //console.log(reply.body.output);
            reply.body.id.should.not.equal(undefined);
            reply.body.output.should.not.equal(undefined);
            reply.body.compilationError.should.equal(false);
            (reply.body.output.indexOf("NameError: global name 'foo245' is not defined")).should.not.equal(-1);

            done();
          });
    });
  });

  it('Mantra Python-UnitTest: error compiling', function (done) {
    // get the source files
    var folder = testConfig.getTestResource("python-unittest/py_error_one_file_manyErrors");
    utilTest.generateTestFromFolder(folder, "Python-UnitTest", "compile", function (data) {
        request(app)
          .post('/')
          .send(data)
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (error, reply) {
            reply.body.id.should.not.equal(undefined);
            reply.body.output.should.not.equal(undefined);
            reply.body.compilationError.should.equal(false);
            (reply.body.output.indexOf("NameError: global name 'bar23' is not defined")).should.not.equal(-1);
            done();
          });
    });
  });

  it('Mantra Python-UnitTest: error compiling', function (done) {
    var folder = testConfig.getTestResource("python-unittest/py_error_and_fail");
    utilTest.generateTestFromFolder(folder, "Python-UnitTest", "compile", function (data) {
        request(app)
          .post('/')
          .send(data)
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (error, reply) {
            //console.log(reply.body.output);
            reply.body.id.should.not.equal(undefined);
            reply.body.output.should.not.equal(undefined);
            reply.body.compilationError.should.equal(false);
            (reply.body.output.indexOf("NameError: global name 'foo245' is not defined")).should.not.equal(-1);
            done();
          });
      });
  });


  it('Mantra Python-UnitTest: error compiling in several files', function (done) {
    var folder = testConfig.getTestResource("python-unittest/py_error_several_files");
    var testFolder = folder + "/Root/test";
    utilTest.generateTestFromFolder(folder, "Python-UnitTest", "compile", function (data) {
        request(app)
          .post('/')
          .send(data)
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (error, reply) {
            //console.log(reply.body.output);
            reply.body.id.should.not.equal(undefined);
            reply.body.output.should.not.equal(undefined);
            reply.body.compilationError.should.equal(false);
            (reply.body.output.indexOf("NameError: global name 'bar33' is not defined")).should.not.equal(-1);
            done();
          });
      });
  });

  it('Mantra Python-UnitTest: successful compiling (one file)', function (done) {
    var folder = testConfig.getTestResource("python-unittest/py_one_file");
    var testFolder = folder + "/Root/test";
    utilTest.generateTestFromFolder(folder, "Python-UnitTest", "compile", function (data) {
        request(app)
          .post('/')
          .send(data)
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (error, reply) {
            //console.log(reply.body.output);
            reply.body.id.should.not.equal(undefined);
            reply.body.output.should.not.equal(undefined);
            reply.body.compilationError.should.equal(false);
            (reply.body.output.indexOf("Goodbye, World!")).should.not.equal(-1);
            (reply.body.output.indexOf("Hi, World!")).should.not.equal(-1);
            done();
          })
    });
  });


  it('Mantra Python-UnitTest: successful compiling several files', function (done) {
    var folder = testConfig.getTestResource("python-unittest/py_several_files");
    var testFolder = folder + "/Root/test";
    utilTest.generateTestFromFolder(folder, "Python-UnitTest", "compile", function (data) {
        request(app)
          .post('/')
          .send(data)
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (error, reply) {
            //console.log(reply.body.output);
            reply.body.id.should.not.equal(undefined);
            reply.body.output.should.not.equal(undefined);
            reply.body.compilationError.should.equal(false);
            (reply.body.output.indexOf("Goodbye, foo!")).should.not.equal(-1);
            (reply.body.output.indexOf("Goodbye, World!")).should.not.equal(-1);
            done();
          });
      });
  });


  it('Mantra Python-UnitTest: successful compiling several files2', function (done) {
    var folder = testConfig.getTestResource("python-unittest/py_several_files2");
    var testFolder = folder + "/Root/test";
    utilTest.generateTestFromFolder(folder, "Python-UnitTest", "compile", function (data) {
        request(app)
          .post('/')
          .send(data)
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (error, reply) {
            //console.log(reply.body.output);
            reply.body.id.should.not.equal(undefined);
            reply.body.output.should.not.equal(undefined);
            reply.body.compilationError.should.equal(false);
            (reply.body.output.indexOf("Goodbye, foo!")).should.not.equal(-1);
            (reply.body.output.indexOf("Goodbye, bar!")).should.not.equal(-1);
            (reply.body.output.indexOf("Goodbye, World!")).should.not.equal(-1);
            done();
          });
      });
  });

  it('Mantra Python-UnitTest: sending several files in folders (1 successful)', function (done) {
    var folder = testConfig.getTestResource("python-unittest/py_several_files_folder");
    var testFolder = folder + "/Root/test";
    utilTest.generateTestFromFolder(folder, "Python-UnitTest", "compile", function (data) {
        request(app)
          .post('/')
          .send(data)
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (error, reply) {
            //console.log(reply.body.output);
            reply.body.id.should.not.equal(undefined);
            reply.body.output.should.not.equal(undefined);
            reply.body.compilationError.should.equal(false);
            (reply.body.output.indexOf("Goodbye, P1.foo!")).should.not.equal(-1);
            (reply.body.output.indexOf("Goodbye, P1.bar!")).should.not.equal(-1);
            (reply.body.output.indexOf("Goodbye, World!")).should.not.equal(-1);
            done();
          });
      });
  });

  it('Mantra Python-UnitTest: sending several files in folders (1 successful)', function (done) {
    var folder = testConfig.getTestResource("python-unittest/py_several_files_folder2");
    var testFolder = folder + "/Root/test";
    utilTest.generateTestFromFolder(folder, "Python-UnitTest", "compile", function (data) {
        request(app)
          .post('/')
          .send(data)
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (error, reply) {
            //console.log(reply.body.output);
            reply.body.id.should.not.equal(undefined);
            reply.body.output.should.not.equal(undefined);
            reply.body.compilationError.should.equal(false);
            (reply.body.output.indexOf("Goodbye, P1.foo!")).should.not.equal(-1);
            (reply.body.output.indexOf("Goodbye, P1.bar!")).should.not.equal(-1);
            (reply.body.output.indexOf("Goodbye, bar!")).should.not.equal(-1);
            (reply.body.output.indexOf("Goodbye, World!")).should.not.equal(-1);
            done();
          });
      });
  });

  it('Mantra Python-UnitTest: template project', function (done) {
    var folder = testConfig.getTestResource("python-unittest/template");
    var testFolder = folder + "/Root/test";
    utilTest.generateTestFromFolder(folder, "Python-UnitTest", "compile", function (data) {
        request(app)
          .post('/')
          .send(data)
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (error, reply) {
            //console.log(reply.body.output);
            reply.body.id.should.not.equal(undefined);
            reply.body.output.should.not.equal(undefined);
            reply.body.compilationError.should.equal(false);
            (reply.body.output.indexOf("The min elememt is:")).should.not.equal(-1);
            (reply.body.output.indexOf("1")).should.not.equal(-1);
            done();
          });
      });
    });
});
