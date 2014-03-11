var validate = require('../');
var couchRegistry = require('./helpers/couch-registry.js');

validate(couchRegistry.start());
