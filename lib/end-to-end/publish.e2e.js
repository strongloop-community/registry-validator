var fs = require('fs-extra');
var path = require('path');
var Promise = require('bluebird');
var npm = require('../npm-exec');
var given = require('../given');
var expect = require('chai').expect;
var debug = require('debug')('registry-validator:end-to-end:publish');

describe('publish', function() {
  it('returns success', function() {
    var pkg = given.packageSync();
    debug('going to publish %j', pkg.path);
    return npm.publish(pkg.path)
      .then(function() {
        debug('result: %j', Array.prototype.slice.call(arguments));
      });
  });

  it('returns error when package version already exists', function() {
    return given.publishedPackage()
      .then(function(pkg) {
        return npm.publish(pkg.path).return(pkg);
      })
      // Strangely enough, it takes three invocations of `npm publish`
      // to get the error
      .then(function(pkg) {
        return npm.publish(pkg.path);
      })
      .then(
        publishShouldHaveFailed,
        expectError(/cannot modify pre-existing version/));
  });

  function publishShouldHaveFailed() {
    throw new Error('npm publish should have failed');
  }

  function expectError(matcher) {
    return function(err) {
      expect(err.message).to.match(matcher);
    };
  }
});
