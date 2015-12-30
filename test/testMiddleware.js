/**
 * Created by hce on 09/07/15.
 *
 * These tests can only test the behavior if
 * the payload is NOT valid. That is, the payload
 * may contain invalid actions, missing the definition of the language etc.
 *
 * The correct behavior is tested indirectly through larger integration tests.
 *
 */


'use strict';

var app = require('../server/server.js'),
  request = require('supertest'),
  util = require('../server/util.js'),
  path = require('path'),
  should = require('should'),
  config = require('../server/config/env/index');


describe('middleware.js: testing invalid payloads', function () {

  var payload = {
    action: 'invalidAction',
    language: 'invalidLanguage'
  };

  it('Detects invalid actions', function (done) {

    request(app)
      .post('/')
      .send(payload)
      .expect('Content-Type', /json/)
      .expect(400, done);
  });


  it('Detects invalid language', function (done) {

    request(app)
      .post('/')
      .send(payload)
      .expect('Content-Type', /json/)
      .expect(400, done);
  });
});
