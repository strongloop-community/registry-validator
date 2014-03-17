var fs = require('fs-extra');
var path = require('path');
var debug = require('debug')('registry-validator:end-to-end:install');
var expect = require('chai').expect;

var npm = require('../npm-exec');
var config = require('../config');
var given = require('../given');

describe('tag', function() {
  var WORK_DIR = config.resolveSandboxPath('work');

  var pkg;
  before(function() {
    return given.publishedPackage()
      .then(function(data) {
        pkg = data;
      });
  });

  beforeEach(resetWorkDir);

  it('sets custom tag', function() {
    return npm.tag(pkg.nameAtVersion, 'stable')
      .then(function() {
        return npm.install(WORK_DIR, pkg.name + '@stable');
      })
      .then(expectPackageFrom(pkg.name + '@stable'));
  });

  function expectPackageFrom(spec) {
    return function() {
      var jsonFile = path.join(
        WORK_DIR, 'node_modules',
        pkg.name, 'package.json');
      var from = require(jsonFile)._from;
      expect(from).to.equal(spec);
    };
  }

  function resetWorkDir() {
    fs.mkdirsSync(WORK_DIR);
  }
});
