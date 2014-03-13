// This file is used by bin/registr-validator.js
// it runs validation for the registry configured via the global object

var Promise = require('bluebird');
var validate = require('../');

var registryUrlPromise = Promise.resolve(global.registryUrl);

describe(global.registryUrl, function() {
  validate(registryUrlPromise, global.options);
});
