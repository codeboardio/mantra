/**
 * Created by Martin on 02/10/15.
 */
'use strict';

var path = require('path');

// All configurations will extend these options
// ============================================
module.exports = {

  pathToResources: './test/test_resources',

  timeOut: 50000,

  getTestResource: function (aNameOfResourceFile) {
    return path.join(this.pathToResources, aNameOfResourceFile);
  }

};

