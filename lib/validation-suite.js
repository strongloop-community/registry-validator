var extend = require('util')._extend;
var path = require('path');
var debug = require('debug')('registry-validator');
var fs = require('fs-extra');
var config = require('./config');
var Promise = require('bluebird');

before(function assertValidConfiguration() {
  debug('config: %j', config);
  if (!config.registryUrl) {
    throw new Error('Registry URL cannot be empty.');
  }
  if (/npmjs/.test(config.registryUrl)) {
    throw new Error(
      'Detected a registry URL that looks like a public npmjs registry.' +
        ' Aborting the validation.');
  }
});

beforeEach(function resetSandbox() {
  fs.removeSync(config.sandbox);
  fs.mkdirsSync(config.sandbox);
});

describe('end-to-end', function() {
  requireDir('./end-to-end');
});

//---- helpers ----//

function requireDir(dir) {
  dir = path.resolve(__dirname, dir);
  fs.readdirSync(dir).forEach(function(name) {
    if (!/\.js$/.test(name)) return;
    require(path.join(dir, name));
  });
}

// Enable long stack traces to simplify troubleshooting
Promise.longStackTraces();

// `npm` reports failures as strings (not errors)
// Bluebird does not reject the promise in such case
Promise.onPossiblyUnhandledRejection(function(e, promise){
  throw e;
});
