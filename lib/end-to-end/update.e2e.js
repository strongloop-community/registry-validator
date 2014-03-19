var fs = require('fs-extra');
var path = require('path');
var expect = require('chai').expect;

var npm = require('../npm-exec');
var config = require('../config');
var given = require('../given');

describe('update', function() {
  var targetDir = config.resolveSandboxPath('work');
  var pkg;

  it('downloads correct version', function() {
    fs.mkdirsSync(targetDir);
    // publish 1.0.0
    return given.publishedPackage({ version: '1.0.0' })
      .then(function(p) {
        pkg = p;
        // install 1.0.0
        return npm.install(targetDir, pkg.name);
      })
      .then(function() {
        // publish 1.0.1
        return given.publishedPackage({ name: pkg.name, version: '1.0.1' });
      })
      .then(function() {
        // update
        return npm.update(targetDir);
      })
      .then(function() {
        // assert version 1.1.0
        var meta = require(targetDir + '/node_modules/' +
          pkg.name + '/package.json');
        expect(meta.version).to.equal('1.0.1');
      });
  });
});
