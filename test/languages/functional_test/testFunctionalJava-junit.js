var app = require('../../../server/server.js'),
  request = require('supertest'),
  express = require('express'),
  should = require('should'),
  bodyParser = require('body-parser'),
  fs = require('fs'),
  utilTest = require('../../helper/utilForTesting.js'),
  testConfig = require('./testFunctionalConfig.js');

app.use(bodyParser());

describe('Test Mantra with Java-JUnit compilation', function () {

  this.timeout(testConfig.timeOut);

  it('Mantra Java-JUnit: successful compilation (one file)', function (done) {
    var folder = testConfig.getTestResource("java/j_one_file");

    utilTest.generateTestFromFolder(folder, "Java-JUnit", "compile", function (data) {
      request(app)
        .post('/')
        .send(data)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (error, reply) {
          (reply.body.output.indexOf("Compilation successful")).should.not.equal(-1);

          reply.body.compilationError.should.equal(false);
          reply.body.id.should.not.equal(undefined);
          done();
        })
    });

  });

  it('Mantra Java-JUnit: successful compilation (several files)', function (done) {
    var folder = testConfig.getTestResource("java/j_several_files");

    utilTest.generateTestFromFolder(folder, "Java-JUnit", "compile", function (data) {
      request(app)
        .post('/')
        .send(data)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (error, reply) {
          (reply.body.output.indexOf("Compilation successful")).should.not.equal(-1);
          reply.body.compilationError.should.equal(false);
          reply.body.id.should.not.equal(undefined);
          done();
        });
    });
  });

  it('Mantra Java-JUnit: successful compilation (several files in folders)', function (done) {
    var folder = testConfig.getTestResource("java/j_several_files_folders");

    utilTest.generateTestFromFolder(folder, "Java-JUnit", "compile", function (data) {
      request(app)
        .post('/')
        .send(data)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (error, reply) {
          (reply.body.output.indexOf("Compilation successful")).should.not.equal(-1);
          reply.body.compilationError.should.equal(false);
          reply.body.id.should.not.equal(undefined);
          done();
        });
    });
  });

  it('Mantra Java-JUnit: error in compilation (one file)', function (done) {
    var folder = testConfig.getTestResource("java/j_error");

    utilTest.generateTestFromFolder(folder, "Java-JUnit", "compile", function (data) {
      request(app)
        .post('/')
        .send(data)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (error, reply) {
          //console.log(reply.body.output);
          (reply.body.output.indexOf("Compilation successful")).should.equal(-1);
          reply.body.compilationError.should.equal(true);
          reply.body.id.should.not.equal(undefined);
          (reply.body.output.indexOf("1 error")).should.not.equal(-1);
          (reply.body.output.indexOf("variable b")).should.not.equal(-1);
          done();
        });
    });
  });

  it('Mantra Java-JUnit: error in setting file', function (done) {
    var folder = testConfig.getTestResource("java/j_error_setting_file");

    utilTest.generateTestFromFolder(folder, "Java-JUnit", "compile", function (data) {
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

  it('Mantra Java-JUnit: error in setting file (missing setting file)', function (done) {
    var folder = testConfig.getTestResource("java/j_error_missing_setting");

    utilTest.generateTestFromFolder(folder, "Java-JUnit", "compile", function (data) {
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

  it('Mantra Java-JUnit: error in compilation (another error)', function (done) {
    var folder = testConfig.getTestResource("java/j_error_main");

    utilTest.generateTestFromFolder(folder, "Java-JUnit", "compile", function (data) {
      request(app)
        .post('/')
        .send(data)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (error, reply) {
          //console.log(reply.body.output);
          (reply.body.output.indexOf("Compilation successful")).should.equal(-1);
          reply.body.compilationError.should.equal(true);
          reply.body.id.should.not.equal(undefined);
          (reply.body.output.indexOf("./Root/BB.java:1: error: cannot find symbol")).should.not.equal(-1);
          (reply.body.output.indexOf("2 errors")).should.not.equal(-1);
          done();
        });
    });
  });

  it('Mantra Java-JUnit: error in compilation (several files)', function (done) {
    var folder = testConfig.getTestResource("java/j_error_several_files");

    utilTest.generateTestFromFolder(folder, "Java-JUnit", "compile", function (data) {
      request(app)
        .post('/')
        .send(data)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (error, reply) {
          reply.body.output.should.not.equal('Compilation successful');
          reply.body.compilationError.should.equal(true);
          reply.body.id.should.not.equal(undefined);
          (reply.body.output.indexOf("2 errors")).should.not.equal(-1);
          done();
        });
    });
  });

  it('Mantra Java-JUnit: successful compilation (several files with tests)', function (done) {
    var folder = testConfig.getTestResource("java/j_severalFiles_withTests");

    utilTest.generateTestFromFolder(folder, "Java-JUnit", "compile", function (data) {
      request(app)
        .post('/')
        .send(data)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (error, reply) {
          //console.log(reply.body.output);
          (reply.body.output.indexOf("Compilation successful")).should.not.equal(-1);
          //reply.body.compilationError.should.equal(false);
          reply.body.id.should.not.equal(undefined);
          //(reply.body.output.indexOf("60 errors")).should.not.equal(-1);
          done();
        });
    });
  });


  it('Mantra Java-JUnit: error compilation (several files with tests)', function (done) {
    var folder = testConfig.getTestResource("java/j_error_severalFiles_withTests");

    utilTest.generateTestFromFolder(folder, "Java-JUnit", "compile", function (data) {
      request(app)
        .post('/')
        .send(data)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (error, reply) {
          //console.log(reply.body.output);
          (reply.body.output.indexOf("Compilation successful")).should.equal(-1);
          //reply.body.compilationError.should.equal(true);
          reply.body.id.should.not.equal(undefined);
          (reply.body.output.indexOf("1 error")).should.not.equal(-1);
          done();
        });
    });
  });

  it('Mantra Java-JUnit: successful incremental compilation ', function (done) {
    var folder = testConfig.getTestResource("java/j_incremental1");

    utilTest.generateTestFromFolder(folder, "Java-JUnit", "compile", function (data) {
      request(app)
        .post('/')
        .send(data)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (error, reply) {
          var folder = testConfig.getTestResource("java/j_incremental2");
          reply.body.compilationError.should.equal(true);
          reply.body.id.should.not.equal(undefined);
          utilTest.generateTestFromFolder(folder, "Java-JUnit", "compile", function (data) {
            data.id = reply.body.id;
            request(app)
              .post('/' + data.id)
              .send(data)
              .expect('Content-Type', /json/)
              .expect(200)
              .end(function (error, reply) {
                //console.log(reply.body.output);
                (reply.body.output.indexOf("Compilation successful")).should.not.equal(-1);
                reply.body.compilationError.should.equal(false);
                reply.body.id.should.not.equal(undefined);
                data.id.should.equal(reply.body.id);
                done();
              });
          });
        });
    });
  });

  it('Mantra Java-JUnit: successful incremental compilation (3 calls with build argument) ', function (done) {
    var folder = testConfig.getTestResource("java/j_incremental_withBuild1");

    utilTest.generateTestFromFolder(folder, "Java-JUnit", "compile", function (data) {
      request(app)
        .post('/')
        .send(data)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (error, reply) {
          var folder = testConfig.getTestResource("java/j_incremental_withBuild2");

          reply.body.compilationError.should.equal(true);
          reply.body.id.should.not.equal(undefined);
          utilTest.generateTestFromFolder(folder, "Java-JUnit", "compile", function (data) {
            data.id = reply.body.id;
            request(app)
              .post('/' + data.id)
              .send(data)
              .expect('Content-Type', /json/)
              .expect(200)
              .end(function (error, reply) {
                var folder = testConfig.getTestResource("java/j_incremental_withBuild3");

                reply.body.compilationError.should.equal(false);
                reply.body.id.should.not.equal(undefined);
                utilTest.generateTestFromFolder(folder, "Java-JUnit", "compile", function (data) {
                  data.id = reply.body.id;
                  request(app)
                    .post('/' + data.id)
                    .send(data)
                    .expect('Content-Type', /json/)
                    .expect(200)
                    .end(function (error, reply) {
                      (reply.body.output.indexOf("Compilation successful")).should.not.equal(-1);
                      reply.body.compilationError.should.equal(false);
                      reply.body.id.should.not.equal(undefined);
                      data.id.should.equal(reply.body.id);
                      done();
                    });
                });
              });
          });
        });
    });
  });

  it('Mantra Java-JUnit: error in incremental compilation ', function (done) {
    var folder = testConfig.getTestResource("java/j_error_incremental1");

    utilTest.generateTestFromFolder(folder, "Java-JUnit", "compile", function (data) {
      request(app)
        .post('/')
        .send(data)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (error, reply) {
          var folder = testConfig.getTestResource("java/j_error_incremental2");

          utilTest.generateTestFromFolder(folder, "Java-JUnit", "compile", function (data) {
            data.id = reply.body.id;
            request(app)
              .post('/' + data.id)
              .send(data)
              .expect('Content-Type', /json/)
              .expect(200)
              .end(function (error, reply) {
                reply.body.output.should.not.equal('Compilation successful');
                reply.body.compilationError.should.equal(true);
                reply.body.id.should.not.equal(undefined);
                data.id.should.equal(reply.body.id);
                done();
              });
          });
        });
    });
  });

  it('Mantra Java-JUnit: successful incremental compilation with wrong ID', function (done) {
    var folder = testConfig.getTestResource("java/j_wrong_id1");

    utilTest.generateTestFromFolder(folder, "Java-JUnit", "compile", function (data) {
      request(app)
        .post('/')
        .send(data)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (error, reply) {
          reply.body.compilationError.should.equal(true);
          reply.body.id.should.not.equal(undefined);
          var folder = testConfig.getTestResource("java/j_wrong_id2");

          utilTest.generateTestFromFolder(folder, "Java-JUnit", "compile", function (data) {
            data.id = "WRONG_ID";
            request(app)
              .post('/' + data.id)
              .send(data)
              .expect('Content-Type', /json/)
              .expect(200)
              .end(function (error, reply) {
                (reply.body.output.indexOf("Compilation successful")).should.not.equal(-1);
                reply.body.compilationError.should.equal(false);
                reply.body.id.should.not.equal(undefined);
                done();
              });
          });
        });
    });
  });

  it('Mantra Java-JUnit: successful run (one file)', function (done) {
    var data = {};
    var folder = testConfig.getTestResource("java/j_run_file");

    utilTest.generateTestFromFolder(folder, "Java-JUnit", "compile", function (data) {
      request(app)
        .post('/')
        .send(data)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (error, reply) {
          //console.log(reply.body.output);
          (reply.body.output.indexOf("Compilation successful")).should.not.equal(-1);
          reply.body.compilationError.should.equal(false);
          reply.body.id.should.not.equal(undefined);
          var data2 = {};
          data2.language = 'Java-JUnit';
          data2.action = 'run';
          data2.id = reply.body.id;
          data2.stream = false;
          request(app)
            .post('/' + data2.id)
            .send(data2)
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function (error, reply) {
              reply.body.output.should.not.equal(undefined);
              (reply.body.output.indexOf("Hello Java Test-1")).should.not.equal(-1);
              done();
            });
        });
    });
  });



  it('Mantra Java-JUnit: successful run (several files)', function (done) {
    var folder = testConfig.getTestResource("java/j_run_several_files");

    utilTest.generateTestFromFolder(folder, "Java-JUnit", "compile", function (data) {
      request(app)
        .post('/')
        .send(data)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (error, reply) {
          (reply.body.output.indexOf("Compilation successful")).should.not.equal(-1);
          reply.body.compilationError.should.equal(false);
          reply.body.id.should.not.equal(undefined);
          var data2 = {};
          data2.language = 'Java-JUnit';
          data2.action = 'run';
          data2.id = reply.body.id;
          data2.stream = false;
          request(app)
            .post('/' + data2.id)
            .send(data2)
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function (error, reply) {
              reply.body.output.should.not.equal(undefined);
              (reply.body.output.indexOf("Hello C")).should.not.equal(-1);
              (reply.body.output.indexOf("Hello B")).should.not.equal(-1);
              (reply.body.output.indexOf("Hello Java Test-2")).should.not.equal(-1);
              done();
            });
        });
    });
  });

  it('Mantra Java-JUnit: successful run (several files in folders)', function (done) {
    var folder = testConfig.getTestResource("java/j_run_several_files_folder");

    utilTest.generateTestFromFolder(folder, "Java-JUnit", "compile", function (data) {
      request(app)
        .post('/')
        .send(data)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (error, reply) {
          (reply.body.output.indexOf("Compilation successful")).should.not.equal(-1);
          reply.body.compilationError.should.equal(false);
          reply.body.id.should.not.equal(undefined);
          var data2 = {};
          data2.language = 'Java-JUnit';
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
              (reply.body.output.indexOf("Hello C")).should.not.equal(-1);
              (reply.body.output.indexOf("Hello B")).should.not.equal(-1);
              (reply.body.output.indexOf("Hello D")).should.not.equal(-1);
              (reply.body.output.indexOf("Hello E")).should.not.equal(-1);
              (reply.body.output.indexOf("Hello Java Test-3")).should.not.equal(-1);
              done();
            });
        });
    });
  });

  it('Mantra Java-JUnit: invalid run due to invalid ID', function (done) {
    var folder = testConfig.getTestResource("java/j_run_invalid_id");

    utilTest.generateTestFromFolder(folder, "Java-JUnit", "run", function (data) {
      data.id = "INVALID_ID";
      request(app)
        .post('/' + data.id)
        .send(data)
        .expect('Content-Type', /json/)
        .expect(404)
        .end(function (error, reply) {
          //console.log(reply.body);
          (reply.body.msg.indexOf("The id INVALID_ID is not valid. Try compiling your project and then execute this request again.")).should.not.equal(-1);
          done();
        });
    });
  });

  it('Mantra Java-JUnit: From Folder: testProject1 - FindPairs (successful compilation and run)', function (done) {
    var folder = testConfig.getTestResource("java/testProject1");

    utilTest.generateTestFromFolder(folder, "Java-JUnit", "compile", function (data) {
      request(app)
        .post('/')
        .send(data)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (error, reply) {
          //console.log(reply.body.output);
          //console.log(reply.body.id);
          (reply.body.output.indexOf("Compilation successful")).should.not.equal(-1);
          reply.body.compilationError.should.equal(false);
          reply.body.id.should.not.equal(undefined);
          data.id = reply.body.id;
          data.action = "run";
          data.stream = false;
          request(app)
            .post('/' + data.id)
            .send(data)
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function (error, reply) {
              //console.log(reply.body.output);
              reply.body.output.should.not.equal(undefined);
              (reply.body.output.indexOf("<h3> Fin Pair Exercise</h3>")).should.not.equal(-1);
              done();
            });
        });
    });
  });

  it('Mantra Java-JUnit: From Folder: testProject2 - JavaPuzzle (successful compilation and run)', function (done) {
    var folder = testConfig.getTestResource("java/testProject2");

    utilTest.generateTestFromFolder(folder, "Java-JUnit", "compile", function (data) {
      request(app)
        .post('/')
        .send(data)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (error, reply) {
          //console.log(reply.body.output);
          //console.log(reply.body.id);
          (reply.body.output.indexOf("Compilation successful")).should.not.equal(-1);
          reply.body.compilationError.should.equal(false);
          reply.body.id.should.not.equal(undefined);
          data.id = reply.body.id;
          data.action = "run";
          request(app)
            .post('/' + data.id)
            .send(data)
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function (error, reply) {
              //console.log(reply.body.output);
              reply.body.output.should.not.equal(undefined);
              (reply.body.output.indexOf("<td><b><font color=\"blue\">Input</font></b></td>")).should.not.equal(-1);
              done();
            });
        });
    });
  });

  it('Mantra Java-JUnit: From Folder: testProject2 - Find Template (successful compilation and run)', function (done) {
    var folder = testConfig.getTestResource("java/testProject3");

    utilTest.generateTestFromFolder(folder, "Java-JUnit", "compile", function (data) {
      request(app)
        .post('/')
        .send(data)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (error, reply) {
          //console.log(reply.body.output);
          //console.log(reply.body.id);
          (reply.body.output.indexOf("Compilation successful")).should.not.equal(-1);
          reply.body.compilationError.should.equal(false);
          reply.body.id.should.not.equal(undefined);
          data.id = reply.body.id;
          data.action = "run";
          request(app)
            .post('/' + data.id)
            .send(data)
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function (error, reply) {
              //console.log(reply.body.output);
              reply.body.output.should.not.equal(undefined);
              (reply.body.output.indexOf("<h4>-- Maximun Element Finder --</h4>")).should.not.equal(-1);
              done();
            });
        });
    });
  });

  it('Mantra Java-JUnit: successful run (one file, bin defined in config file)', function (done) {
    var folder = testConfig.getTestResource("java/j_run_file_bin_config");

    utilTest.generateTestFromFolder(folder, "Java-JUnit", "compile", function (data) {
      request(app)
        .post('/')
        .send(data)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (error, reply) {
          //console.log(reply.body.output);
          (reply.body.output.indexOf("Compilation successful")).should.not.equal(-1);
          reply.body.compilationError.should.equal(false);
          reply.body.id.should.not.equal(undefined);
          var data2 = {};
          data2.language = 'Java-JUnit';
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
              (reply.body.output.indexOf("Hello Java Test-1")).should.not.equal(-1);
              done();
            });
        });
    });
  });
});

describe('Test Java-JUnit: Running generates correct output', function () {

  this.timeout(testConfig.timeOut);

  it('Mantra Java-JUnit: From Folder: testProject5 - Output has 2 newlines if last statement has newline', function (done) {
    var folder = testConfig.getTestResource("/java/testProject5");

    utilTest.generateTestFromFolder(folder, "Java-JUnit", "compile", function (data) {
      request(app)
        .post('/')
        .send(data)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (error, reply) {
          //console.log(reply.body.output);
          //console.log(reply.body.id);
          (reply.body.output.indexOf("Compilation successful")).should.not.equal(-1);
          reply.body.compilationError.should.equal(false);
          reply.body.id.should.not.equal(undefined);
          data.id = reply.body.id;
          data.action = "run";
          request(app)
            .post('/' + data.id)
            .send(data)
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function (error, reply) {
              //console.log(reply.body.output);
              // the test input does not have the additional \n at the end, but mantraJava needs to add it
              // because the docker-run-timeout script relies on all programs ending on a new line
              reply.body.output.should.equal('hello\r\nhellohello\r\n');
              done();
            });
        });
    });
  });

});