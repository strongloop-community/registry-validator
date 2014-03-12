require('mocha-as-promised')();

var extend = require('util')._extend;
var path = require('path');
var debug = require('debug')('registry-validator');
var fs = require('fs-extra');
var config = require('./lib/config');
var Promise = require('bluebird');

/**
 * @param {Promise} registryUrlPromise A promise that is resolved with
 * the URL of the registry to validate.
 * @param {{userCredentials,userEmail}} options Options.
 * `userCredentials` is `login:password` or null
 */
module.exports = function validate(registryUrlPromise, options) {
  before(function() {
    return registryUrlPromise
      .bind(this)
      .then(function(url) {
        extend(config, options);
        config.registryUrl = url;
        debug('config: %j', config);
      });
  });

  beforeEach(function() {
    fs.removeSync(config.sandbox);
    fs.mkdirsSync(config.sandbox);
  });

  describe('end-to-end', function() {
    requireDir('./lib/end-to-end');
  });
};

function requireDir(dir) {
  dir = path.resolve(__dirname, dir);
  fs.readdirSync(dir).forEach(function(name) {
    if (!/\.js$/.test(name)) return;
    require(path.join(dir, name));
  });
}

// Enable long stack traces to simplify trouble shooting
Promise.longStackTraces();

// `npm` reports failures as strings (not errors)
// Bluebird does not reject the promise in such case
Promise.onPossiblyUnhandledRejection(function(e, promise){
  throw e;
});
