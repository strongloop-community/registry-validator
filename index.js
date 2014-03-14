var extend = require('util')._extend;
var Mocha = require('mocha');
var config = require('./lib/config');

require('mocha-as-promised')();

/**
 * Configure the validation suite.
 * @param {String} registryUrl
 * @param {{userCredentials}} options
 * @returns {Object} this object (fluent interface)
 */
exports.configure = function(registryUrl, options) {
  extend(config, options);
  config.registryUrl = registryUrl;
  return this; // fluent interface
};

/**
 * Run the validation suite with the configuration specified by `configure()`.
 *
 * This method creates and executes a new Mocha runner under the hood,
 * it should not be called from another Mocha test suite. Use `defineSuite`
 * in such case.
 * @param {function(Error=)} callback
 */
exports.run = function(callback) {
  var mocha = new Mocha();
  mocha.reporter('spec');
  mocha.ui = 'bdd';
  mocha.files = [require.resolve('./lib/validation-suite')];

  mocha.run(function(failures) {
    if (failures)
      callback(new Error(failures + ' test(s) failed.'));
    else
      callback();
  });
};

/**
 * Define mocha suites & tests.
 *
 * This function must be called on the first tick of the program (i.e. you
 * can't call it from a callback of your registry setup function).
 * However, you can add a `before` hook before calling this function.
 * The hook should setup your registry and call `configure`.
 *
 * ```js
 * var validator = require('registry-validator');
 *
 * describe('My Registry', function() {
 *   before(function(done) {
 *     startRegistry(function(err, url) {
 *       if (err) done(err);
 *       validator.configure(url, { userCredentials: 'admin:pass' });
 *     });
 *   });
 *
 *   validator.defineSuite();
 * });
 * ```
 */
exports.defineSuite = function() {
  require('./lib/validation-suite');
};

