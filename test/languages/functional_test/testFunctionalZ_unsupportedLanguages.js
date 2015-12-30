var app = require('../../../server/server.js'),
  request = require('supertest'),
  express = require('express'),
  should = require('should'),
  bodyParser = require('body-parser'),
  fs = require('fs'),
  utilTest = require('../../helper/utilForTesting.js'),
  testConfig = require('./testFunctionalConfig.js');

app.use(bodyParser());

describe('Test Mantra with Unsupported languages', function () {

  it('Mantra Unsupported languages: compilation', function (done) {
    var folder = testConfig.getTestResource("python/py_one_file");

    utilTest.generateTestFromFolder(folder, "Unsupported", "compile", function (data) {
      request(app)
        .post('/')
        .send(data)
        .expect('Content-Type', /json/)
        .expect(500)
        .end(function (error, reply) {
          //console.log(reply.body);
          (reply.body.msg.indexOf("Invalid language. Make sure to provide a valid language as part of the payload. Valid languages are:")).should.not.equal(-1);
          done();
        })
    });
  });


  it('Mantra Unsupported languages: running with wrong ID', function (done) {
    var folder = testConfig.getTestResource("python/py_one_file");

    utilTest.generateTestFromFolder(folder, "Unsupported", "run", function (data) {
      request(app)
        .post('/')
        .send(data)
        .expect('Content-Type', /json/)
        .expect(500)
        .end(function (error, reply) {
          //console.log(reply.body);
          (reply.body.msg.indexOf('Invalid language. Make sure to provide a valid language as part of the payload. Valid languages are:')).should.not.equal(-1);
          done();
        })
    });
  });


  it('Mantra Unsupported languages: running with correct ID', function (done) {
    var folder = testConfig.getTestResource("python/py_one_file");

    utilTest.generateTestFromFolder(folder, "Python", "run", function (data) {

      request(app)
        .post('/123456')
        .send(data)
        .expect('Content-Type', /json/)
        .expect(500)
        .end(function (error, reply) {
          data.id = reply.body.id;
          data.language = "unsupported";
          request(app)
            .post('/'+data.id)
            .send(data)
            .expect('Content-Type', /json/)
            .expect(500)
            .end(function (error, reply) {
              //console.log(reply.body);
              (reply.body.msg.indexOf('Invalid language. Make sure to provide a valid language as part of the payload. Valid languages are:')).should.not.equal(-1);
              done();
            })
        })
    });
  });


  it('Mantra Unsupported languages: running with correct ID and using Python-UnitTest', function (done) {
    var folder = testConfig.getTestResource("python/py_one_file");
    utilTest.generateTestFromFolder(folder, "Python-Python-UnitTest", "run", function (data) {

      request(app)
        .post('/123456')
        .send(data)
        .expect('Content-Type', /json/)
        .expect(500)
        .end(function (error, reply) {
          data.id = reply.body.id;
          data.language = "unsupported";
          request(app)
            .post('/'+data.id)
            .send(data)
            .expect('Content-Type', /json/)
            .expect(500)
            .end(function (error, reply) {
              //console.log(reply.body.output);
              (reply.body.msg.indexOf('Invalid language. Make sure to provide a valid language as part of the payload. Valid languages are:')).should.not.equal(-1);
              done();
            })
        })
    });
  });
});