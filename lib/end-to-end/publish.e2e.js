var npm = require('../npm-exec');
var given = require('../given');
var debug = require('debug')('registry-validator:end-to-end:publish');

describe('publish', function() {
  it('returns success', function() {
    var pkg = given.packageSync();
    debug('going to publish %j', pkg.path);
    return npm('publish', [pkg.path])
      .then(function() {
        debug('result: %j', Array.prototype.slice.call(arguments));
      });
  });
});
