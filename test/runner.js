var validator = require('../');
var couchRegistry = require('./helpers/couch-registry.js');

describe('The npmjs.org registry', function() {
  before(function() {
    return couchRegistry.start()
      .then(function(url) {
        validator.configure(url, {
          userCredentials: couchRegistry.userCredentials
        });
      });
  });

  validator.defineSuite();
});
