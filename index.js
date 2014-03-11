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
  describe('The Registry', function() {
    before(function() {
      return registryUrlPromise
        .bind(this)
        .then(function(url) {
          extend(config, options);
          config.registryUrl = url;
          fs.removeSync(config.sandbox);
          fs.mkdirsSync(config.sandbox);
          debug('config: %j', config);
        });
    });

    describe('end-to-end', function() {
      // TODO - iterate all files in end-to-end
      require('./lib/end-to-end/publish.e2e');
    });
  });
};

// Enable long stack traces to simplify trouble shooting
Promise.longStackTraces();

// `npm` reports failures as strings (not errors)
// Bluebird does not reject the promise in such case
Promise.onPossiblyUnhandledRejection(function(e, promise){
  throw e;
});
