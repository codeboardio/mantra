/**
 * Created by hce on 04/08/15.
 *
 * Tests for functions that use the the Docker Remote API.
 */

'use strict';

var should = require('should'),
  docker = require('../../server/docker/docker.js');


describe('docker/docker.js: testing container creation', function () {


  it('Creates a new container', function(done) {

    var containerImage = 'ubuntu',
      command = 'ls -l',
      workingDir = '/tmp/projects';

    docker.createContainer(containerImage, command, workingDir, false, {cpu: 20, session: 20 , sessionNoStream: 20})
      .then(function(containerId) {
        //console.log('ContainerId is: ' + containerId);
        done();
      })
      .catch(function(err) {
        console.log('Error during test for creating new container');
        done();
      });

    //var cmd = languages.getCommandForCompileAction(payload.language, payload.config, payload.files);
    //cmd.should.equal('gcc ./Root/main.c ./Root/test.c ./Root/test2.c');
  });

});
