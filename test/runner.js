var validate = require('../');
var couchRegistry = require('./helpers/couch-registry.js');

var registryUrlPromise = couchRegistry.start();
validate(registryUrlPromise, {
  userCredentials: couchRegistry.userCredentials
});
