'use strict';

// Test specific configuration
// ===========================
module.exports = {

  // the path where Mantra should store a project's files
  // NOTE: with boot2docker, mounting folders from the host will only work correctly for subfolders of /Users/
  // see also: http://stackoverflow.com/questions/26348353/mount-volume-to-docker-image-on-osx
  mantraPath: process.env.MANTRA_PATH || '/tmp/projects',

  // the maximum valid life time of a mantra id (in seconds); keep it short for unit tests
  maxLifeTimeForMantraId: 100,

  // configuration of the Docker Remote API
  docker: {
    // the Url of the Docker Remote API
    hostIP: process.env.DockerHostUrl || "127.0.0.1",
    // the port of the Docker Remote API
    hostPort: process.env.DockerHostPort || "4243"
  }

};