var validate = require('../');
var couchRegistry = require('./helpers/couch-registry.js');

var registryUrlPromise = couchRegistry.start();

describe('The npmjs.org registry', function() {
  validate(registryUrlPromise, {
    userCredentials: couchRegistry.userCredentials,
    userEmail: 'test@registry-validator'
  });
});
